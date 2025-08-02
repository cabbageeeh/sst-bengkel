import { Response, Request } from "../../type";
import DB from "../services/DB";
import { v4 as uuidv4 } from 'uuid';

class Controller {

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
            // Get vehicles with customer info for dropdown
            const vehicles = await DB.from("vehicles")
                .select(
                    "vehicles.*",
                    "customers.name as customer_name"
                )
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .orderBy("customers.name");

            return response.inertia("spk/create", {
                vehicles
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
                notes
            } = request.body;

            // Validate required fields
            if (!vehicle_id || !service_description) {
                return response.status(400).json({
                    error: "Vehicle dan deskripsi servis harus diisi"
                });
            }

            // Generate SPK number
            const spkNumber = await this.generateSPKNumber();
            const now = Date.now();

            const spkData = {
                id: uuidv4(),
                vehicle_id,
                spk_number: spkNumber,
                service_description,
                estimated_cost: estimated_cost || 0,
                status: 'draft',
                notes,
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
                    "customers.name as customer_name",
                    "customers.phone as customer_phone",
                    "customers.email as customer_email"
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
                .where("id", id)
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
                status,
                notes
            } = request.body;

            const updateData = {
                vehicle_id,
                service_description,
                estimated_cost,
                actual_cost,
                status,
                notes,
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

            return response.redirect("/spk?success=SPK berhasil diperbarui");
        } catch (error) {
            console.error('Error updating SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memperbarui SPK"
            });
        }
    }

    public async destroy(request: Request, response: Response) {
        try {
            const { id } = request.params;

            const deleted = await DB.from("spk")
                .where("id", id)
                .del();

            if (!deleted) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            return response.redirect("/spk?success=SPK berhasil dihapus");
        } catch (error) {
            console.error('Error deleting SPK:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menghapus SPK"
            });
        }
    }

    private async generateSPKNumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
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

        return `SPK-${year}${month}-${String(sequence).padStart(4, '0')}`;
    }
}

export default new Controller();
