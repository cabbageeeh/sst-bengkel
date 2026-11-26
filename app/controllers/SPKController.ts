import { Response, Request } from "../../type";
import DB from "../services/DB";
import PdfService from "../services/PdfService";
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert time string (HH:MM) to timestamp of today
 */
function timeStringToTimestamp(timeString: string): number | null {
    if (!timeString) return null;
    
    const today = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    today.setHours(hours, minutes, 0, 0);
    return today.getTime();
}

class SPKController {
    constructor() {
        this.complete = this.complete.bind(this);
        this.calculateTotalCost = this.calculateTotalCost.bind(this);
        this.calculateSparepartTotal = this.calculateSparepartTotal.bind(this);
    }

    /**
     * Helper method to calculate total cost from service and sparepart items
     */
    public calculateTotalCost(serviceCost: number, sparepartItems: any[]): number {
        const sparepartTotal = this.calculateSparepartTotal(sparepartItems);
        return serviceCost + sparepartTotal;
    }

    /**
     * Helper method to calculate sparepart total cost
     */
    public calculateSparepartTotal(sparepartItems: any[]): number {
        return sparepartItems.reduce((total, item) => {
            return total + (item.unit_price * item.quantity);
        }, 0);
    }

    public async index(request: Request, response: Response) {
        try {
            const page = Math.max(1, parseInt(request.query.page as string) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(request.query.limit as string) || 10));
            const search = request.query.search as string || "";
            const status = request.query.status as string || "";
            const offset = (page - 1) * limit;

            let query = DB.from("spk")
                .select(
                    "spk.*",
                    "vehicles.license_plate",
                    "vehicles.brand",
                    "vehicles.model",
                    "vehicles.year",
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

            // Count every matching status before filtering or paginating the list.
            const statusCounts = await query.clone()
                .clearSelect()
                .select("spk.status")
                .count("spk.id as count")
                .groupBy("spk.status");
            const summary = { total: 0, draft: 0, in_progress: 0, completed: 0, cancelled: 0 };
            for (const row of statusCounts) {
                const count = Number(row.count) || 0;
                summary.total += count;
                if (Object.prototype.hasOwnProperty.call(summary, row.status) && row.status !== 'total') {
                    summary[row.status as keyof typeof summary] = count;
                }
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
                summary,
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
                jam_masuk,
                jam_janji_selesai,
                jarak,
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
                jam_masuk: timeStringToTimestamp(jam_masuk) || now,
                jam_janji_selesai: timeStringToTimestamp(jam_janji_selesai),
                jarak: jarak ? parseInt(jarak) : (kilometer ? parseInt(kilometer) : null),
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
                jam_masuk,
                jam_janji_selesai,
                jarak,
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
                jam_masuk: jam_masuk ? timeStringToTimestamp(jam_masuk) : null,
                jam_janji_selesai: jam_janji_selesai ? timeStringToTimestamp(jam_janji_selesai) : null,
                jarak: jarak ? parseInt(jarak) : (kilometer ? parseInt(kilometer) : null),
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
            const { service_cost, sparepart_items } = await request.json();

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

            // Validate service_cost
            if (!service_cost || isNaN(parseFloat(service_cost))) {
                return response.status(422).json({
                    error: "Biaya service harus diisi dengan angka yang valid"
                });
            }

            // Validate sparepart_items
            if (!Array.isArray(sparepart_items)) {
                return response.status(422).json({
                    error: "Data sparepart harus berupa array"
                });
            }

            // Validate each sparepart item
            for (const item of sparepart_items) {
                if (!item.item_name || !item.item_name.trim()) {
                    return response.status(422).json({
                        error: "Nama item sparepart harus diisi"
                    });
                }
                if (!item.quantity || isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
                    return response.status(422).json({
                        error: "Quantity sparepart harus berupa angka positif"
                    });
                }
                if (!item.unit_price || isNaN(parseFloat(item.unit_price)) || parseFloat(item.unit_price) <= 0) {
                    return response.status(422).json({
                        error: "Harga satuan sparepart harus berupa angka positif"
                    });
                }
            }

            // Calculate total actual cost using helper method
            const totalActualCost = this.calculateTotalCost(parseFloat(service_cost), sparepart_items.map(item => ({
                unit_price: parseFloat(item.unit_price),
                quantity: parseInt(item.quantity)
            })));
            const totalSparepartCost = this.calculateSparepartTotal(sparepart_items.map(item => ({
                unit_price: parseFloat(item.unit_price),
                quantity: parseInt(item.quantity)
            })));

            // Start transaction
            const trx = await DB.transaction();

            try {
                // Update SPK status and actual cost
                const updateData: any = {
                    actual_cost: totalActualCost,
                    status: 'completed',
                    tanggal_keluar: Date.now(),
                    updated_at: Date.now()
                };

                await trx.from("spk")
                    .where("id", id)
                    .update(updateData);

                // Delete existing spk_items for this SPK (in case of re-completion)
                await trx.from("spk_items")
                    .where("spk_id", id)
                    .del();

                // Insert service item
                const serviceItemId = uuidv4();
                await trx.from("spk_items").insert({
                    id: serviceItemId,
                    spk_id: id,
                    item_name: "Jasa Service",
                    description: currentSPK.service_description,
                    quantity: 1,
                    unit_price: parseFloat(service_cost),
                    total_price: parseFloat(service_cost),
                    type: 'service',
                    created_at: Date.now(),
                    updated_at: Date.now()
                });

                // Insert sparepart items
                for (const item of sparepart_items) {
                    const itemId = uuidv4();
                    const quantity = parseInt(item.quantity);
                    const unitPrice = parseFloat(item.unit_price);
                    const totalPrice = quantity * unitPrice;

                    await trx.from("spk_items").insert({
                        id: itemId,
                        spk_id: id,
                        item_name: item.item_name.trim(),
                        description: item.description?.trim() || null,
                        quantity: quantity,
                        unit_price: unitPrice,
                        total_price: totalPrice,
                        type: 'part',
                        created_at: Date.now(),
                        updated_at: Date.now()
                    });
                }

                // Commit transaction
                await trx.commit();

                return response.status(200).json({
                    success: true,
                    message: "SPK berhasil diselesaikan dengan rincian biaya",
                    data: {
                        service_cost: parseFloat(service_cost),
                        sparepart_cost: totalSparepartCost,
                        total_cost: totalActualCost
                    }
                });
            } catch (error) {
                // Rollback transaction
                await trx.rollback();
                throw error;
            }
        } catch (error) {
            console.error('Error completing SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menyelesaikan SPK"
            });
        }
    }

    public async generatePdf(request: Request, response: Response) {
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

            // Get SPK items (service and spareparts)
            const spkItems = await DB.from("spk_items")
                .where("spk_id", id)
                .orderBy("type", "asc") // service first, then parts
                .orderBy("created_at", "asc");

            // Separate service and sparepart items
            const serviceItems = spkItems.filter(item => item.type === 'service');
            const sparepartItems = spkItems.filter(item => item.type === 'part');

            // Add items data to SPK object
            const spkWithItems = {
                ...spk,
                service_items: serviceItems,
                sparepart_items: sparepartItems,
                service_total: serviceItems.reduce((total, item) => total + parseFloat(item.total_price), 0),
                sparepart_total: sparepartItems.reduce((total, item) => total + parseFloat(item.total_price), 0)
            };

            // Generate the paginated A4 work order from current SPK data.
            const pdfBuffer = await PdfService.generateSpkPdf(spkWithItems);
            
            // Set response headers untuk download PDF
            response.setHeader('Content-Type', 'application/pdf');
            const filename = String(spk.spk_number).replace(/[^a-zA-Z0-9_-]/g, '_');
            response.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
            response.setHeader('Content-Length', pdfBuffer.length.toString());
            
            return response.end(pdfBuffer);
        } catch (error) {
            console.error('Error generating SPK PDF:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat membuat PDF SPK"
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
