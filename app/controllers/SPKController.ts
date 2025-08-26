import { Response, Request } from "../../type";
import DB from "../services/DB";
import { v4 as uuidv4 } from 'uuid';

class SPKController {

    public async index(request: Request, response: Response) {
        try {
            const page = parseInt(request.query.page as string) || 1;
            const limit = parseInt(request.query.limit as string) || 10;
            const search = request.query.search as string || "";
            const status = request.query.status as string || "";
            const offset = (page - 1) * limit;

            let query = DB.from("spk")
                .select(
                    "spk.*",
                    "vehicles.license_plate",
                    "vehicles.brand",
                    "vehicles.model",
                    "customers.name as customer_name"
                )
                .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
                .leftJoin("customers", "vehicles.customer_id", "customers.id");

            if (search) {
                query = query.where(function() {
                    this.where("spk.spk_number", "like", `%${search}%`)
                        .orWhere("vehicles.license_plate", "like", `%${search}%`)
                        .orWhere("customers.name", "like", `%${search}%`);
                });
            }

            if (status) {
                query = query.where("spk.status", status);
            }

            const totalItems = await query.clone().count("* as count").first();
            const totalPages = Math.ceil((totalItems?.count as number) / limit);

            const spks = await query
                .orderBy("spk.created_at", "desc")
                .limit(limit)
                .offset(offset);

            return response.inertia("spk/index", {
                spks,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_items: totalItems?.count,
                    per_page: limit
                },
                search,
                status,
                success: request.query.success || null
            });
        } catch (error) {
            console.error('Error fetching SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data SPK"
            });
        }
    }

    public async create(request: Request, response: Response) {
        try {
            const vehicleId = request.query.vehicle_id as string;
            
            // Get vehicles with customer info for dropdown
            const vehicles = await DB.from("vehicles")
                .select(
                    "vehicles.*",
                    "customers.name as customer_name"
                )
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .orderBy("customers.name");

            // Get selected vehicle info if vehicle_id is provided
            let selectedVehicle = null;
            if (vehicleId) {
                selectedVehicle = await DB.from("vehicles")
                    .select(
                        "vehicles.*",
                        "customers.name as customer_name"
                    )
                    .leftJoin("customers", "vehicles.customer_id", "customers.id")
                    .where("vehicles.id", vehicleId)
                    .first();
            }

            return response.inertia("spk/create", {
                vehicles,
                selectedVehicle,
                preSelectedVehicleId: vehicleId
            });
        } catch (error) {
            console.error('Error loading SPK create page:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memuat halaman"
            });
        }
    }

    public async store(request: Request, response: Response) {
        try {
            const {
                vehicle_id,
                service_description,
                estimated_cost,
                kilometer,
                keluhan,
                notes
            } = await request.json();

            // Validate required fields
            if (!vehicle_id || !service_description) {
                return response.status(422).json({
                    error: "Vehicle dan deskripsi servis harus diisi"
                });
            }

            // Check if vehicle exists
            const vehicle = await DB.from("vehicles")
                .where("id", vehicle_id)
                .first();

            if (!vehicle) {
                return response.status(422).json({
                    error: "Kendaraan tidak ditemukan"
                });
            }

            // Generate SPK number
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');

            // Get the last SPK number for this month
            const lastSPK = await DB.from("spk")
                .where("spk_number", "like", `SPK-${year}${month}%`)
                .orderBy("spk_number", "desc")
                .first();

            let sequence = 1;
            if (lastSPK) {
                const lastSequence = parseInt(lastSPK.spk_number.split('-')[2]);
                sequence = lastSequence + 1;
            }

            const spkNumber = `SPK-${year}${month}-${String(sequence).padStart(4, '0')}`;
            const now = Date.now();

            const spkData = {
                id: uuidv4(),
                vehicle_id,
                spk_number: spkNumber,
                service_description: service_description.trim(),
                estimated_cost: estimated_cost ? parseFloat(estimated_cost) : 0,
                kilometer: kilometer ? parseInt(kilometer) : null,
                keluhan: keluhan?.trim() || null,
                status: 'in_progress',
                tanggal_masuk: now,
                tanggal_keluar: null,
                notes: notes?.trim() || null,
                created_at: now,
                updated_at: now
            };

            await DB.from("spk").insert(spkData);

            return response.redirect("/spk?success=SPK berhasil dibuat");
        } catch (error) {
            console.error('Error creating SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat membuat SPK"
            });
        }
    }

    public async show(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const spk = await DB.from("spk")
                .select(
                    "spk.*",
                    "vehicles.license_plate",
                    "vehicles.brand",
                    "vehicles.model",
                    "vehicles.year",
                    "vehicles.engine_type",
                    "vehicles.color",
                    "customers.name as customer_name",
                    "customers.phone as customer_phone",
                    "customers.address as customer_address"
                )
                .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .where("spk.id", id)
                .first();
            
            if (!spk) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            // Get SPK items
            const spkItems = await DB.from("spk_items")
                .where("spk_id", id)
                .orderBy('created_at');
            
            return response.inertia("spk/show", {
                spk,
                spkItems
            });
        } catch (error) {
            console.error('Error fetching SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data SPK"
            });
        }
    }

    public async edit(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const spk = await DB.from("spk")
                .select(
                    "spk.*",
                    "vehicles.license_plate",
                    "vehicles.brand",
                    "vehicles.model",
                    "vehicles.year",
                    "vehicles.engine_type",
                    "vehicles.color",
                    "customers.name as customer_name",
                    "customers.phone as customer_phone",
                    "customers.address as customer_address"
                )
                .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .where("spk.id", id)
                .first();
            
            if (!spk) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            // Get vehicles for dropdown
            const vehicles = await DB.from("vehicles")
                .select(
                    "vehicles.*",
                    "customers.name as customer_name"
                )
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .orderBy("customers.name");
            
            return response.inertia("spk/edit", {
                spk,
                vehicles
            });
        } catch (error) {
            console.error('Error loading SPK edit page:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memuat halaman"
            });
        }
    }

    public async update(request: Request, response: Response) {
        try {
            const { id } = request.params;
            const {
                vehicle_id,
                service_description,
                estimated_cost,
                actual_cost,
                kilometer,
                keluhan,
                status,
                notes
            } = await request.json();

            // Get current SPK to check status change
            const currentSPK = await DB.from("spk")
                .where("id", id)
                .first();

            if (!currentSPK) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            const updateData: any = {
                vehicle_id,
                service_description: service_description?.trim(),
                estimated_cost: estimated_cost ? parseFloat(estimated_cost) : null,
                actual_cost: actual_cost ? parseFloat(actual_cost) : null,
                kilometer: kilometer ? parseInt(kilometer) : null,
                keluhan: keluhan?.trim() || null,
                status,
                notes: notes?.trim() || null,
                updated_at: Date.now()
            };

            // Auto-fill tanggal_keluar when status changes to completed
            if (status === 'completed' && currentSPK.status !== 'completed' && !currentSPK.tanggal_keluar) {
                updateData.tanggal_keluar = Date.now();
            }

            const updated = await DB.from("spk")
                .where("id", id)
                .update(updateData);

            if (!updated) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            return response.status(200).json({
                success: true,
                message: "SPK berhasil diperbarui"
            });
        } catch (error) {
            console.error('Error updating SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memperbarui SPK"
            });
        }
    }

    public async complete(request: Request, response: Response) {
        try {
            const { id } = request.params;
            const { actual_cost } = await request.json();

            // Get current SPK
            const currentSPK = await DB.from("spk")
                .where("id", id)
                .first();

            if (!currentSPK) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            // Check if SPK is already completed
            if (currentSPK.status === 'completed') {
                return response.status(422).json({
                    error: "SPK sudah dalam status selesai"
                });
            }

            // Validate actual_cost
            if (!actual_cost || isNaN(parseFloat(actual_cost))) {
                return response.status(422).json({
                    error: "Biaya aktual harus diisi dengan angka yang valid"
                });
            }

            const updateData: any = {
                actual_cost: parseFloat(actual_cost),
                status: 'completed',
                tanggal_keluar: Date.now(),
                updated_at: Date.now()
            };

            const updated = await DB.from("spk")
                .where("id", id)
                .update(updateData);

            if (!updated) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            return response.status(200).json({
                success: true,
                message: "SPK berhasil diselesaikan"
            });
        } catch (error) {
            console.error('Error completing SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menyelesaikan SPK"
            });
        }
    }

    public async destroy(request: Request, response: Response) {
        try {
            const { id } = request.params;

            const spk = await DB.from("spk")
                .where("id", id)
                .first();

            if (!spk) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            // Get invoice count for response message
            const invoiceCountResult = await DB.from("invoices")
                .where("spk_id", id)
                .count('* as total')
                .first();

            const invoiceCount = Number((invoiceCountResult as any).total || 0);

            // Use database transaction for cascade delete
            await DB.transaction(async (trx) => {
                // Enable foreign key constraints (important for SQLite)
                await trx.raw('PRAGMA foreign_keys = ON');

                // Delete SPK - foreign key constraints will handle cascade
                const deletedRows = await trx.table("spk")
                    .where("id", id)
                    .delete();

                if (deletedRows === 0) {
                    throw new Error("SPK not found or already deleted");
                }
            });

            // Prepare success message based on invoice count
            let message = "SPK berhasil dihapus";
            if (invoiceCount > 0) {
                message = `SPK berhasil dihapus beserta ${invoiceCount} invoice yang terkait`;
            }

            return response.status(200).json({
                success: true,
                message: message,
                data: {
                    id,
                    deletedInvoices: invoiceCount
                }
            });
        } catch (error) {
            console.error('Error deleting SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menghapus SPK"
            });
        }
    }


}

export default new SPKController();
