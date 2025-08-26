import DB from "../services/DB";
import { Response, Request } from "../../type";
import { randomUUID } from "crypto";

class CustomerController {
    public async index(request: Request, response: Response) {
        const page = parseInt(request.query.page as string) || 1;
        const search = request.query.search as string || "";
        const limit = 10;
        
        let query = DB.from("customers").select("*");
        
        // Apply search
        if (search) {
            query = query.where(function() {
                this.where('name', 'like', `%${search}%`)
                    .orWhere('phone', 'like', `%${search}%`);
            });
        }
        
        // Get total count
        const countQuery = query.clone();
        const totalResult = await countQuery.count('* as total').first();
        const totalItems = Number((totalResult as any)?.total || 0);

        // Get paginated results with vehicle count
        const customers = await query
            .orderBy('created_at', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        // Add vehicle count to each customer
        for (const customer of customers) {
            const vehicleCountResult = await DB.from("vehicles")
                .where("customer_id", customer.id)
                .count('* as total')
                .first();
            customer.vehicle_count = Number((vehicleCountResult as any).total || 0);
        }

        const totalPages = Math.ceil(totalItems / limit);

        return response.inertia("customers/index", {
            customers,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_items: totalItems,
                per_page: limit
            },
            search,
            success: request.query.success || null
        });
    }

    public async create(request: Request, response: Response) {
        return response.inertia("customers/create");
    }

    public async store(request: Request, response: Response) {
        try {
            const { name, phone, address } = await request.json();
            
            // Validation
            if (!name || name.trim() === '') {
                return response.status(422).json({
                    error: "Nama pelanggan wajib diisi"
                });
            }
            
            if (!phone || phone.trim() === '') {
                return response.status(422).json({
                    error: "Nomor telepon wajib diisi"
                });
            }
            
            // Check if phone number already exists
            const existingCustomer = await DB.from("customers")
                .where("phone", phone.trim())
                .first();
            
            if (existingCustomer) {
                return response.status(422).json({
                    error: "Nomor telepon sudah digunakan oleh pelanggan lain"
                });
            }
            
            const customerId = randomUUID();
            const now = Date.now();
            
            await DB.table("customers").insert({
                id: customerId,
                name: name.trim(),
                phone: phone.trim(),
                address: address?.trim() || null,
                created_at: now,
                updated_at: now
            });
            
            return response.redirect("/customers?success=Customer berhasil ditambahkan");
        } catch (error) {
            console.error('Error creating customer:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menyimpan data pelanggan"
            });
        }
    }

    public async show(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const customer = await DB.from("customers")
                .where("id", id)
                .first();
            
            if (!customer) {
                return response.status(404).json({
                    error: "Pelanggan tidak ditemukan"
                });
            }
            
            // Get customer's vehicles
            const vehicles = await DB.from("vehicles")
                .where("customer_id", id)
                .orderBy('created_at', 'desc');
            
            return response.inertia("customers/show", {
                customer,
                vehicles
            });
        } catch (error) {
            console.error('Error fetching customer:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data pelanggan"
            });
        }
    }

    public async edit(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const customer = await DB.from("customers")
                .where("id", id)
                .first();
            
            if (!customer) {
                return response.status(404).json({
                    error: "Pelanggan tidak ditemukan"
                });
            }
            
            return response.inertia("customers/edit", {
                customer
            });
        } catch (error) {
            console.error('Error fetching customer:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data pelanggan"
            });
        }
    }

    public async update(request: Request, response: Response) {
        try {
            const { id } = request.params;
            const { name, phone, address } = await request.json();
            
            // Validation
            if (!name || name.trim() === '') {
                return response.status(422).json({
                    error: "Nama pelanggan wajib diisi"
                });
            }
            
            if (!phone || phone.trim() === '') {
                return response.status(422).json({
                    error: "Nomor telepon wajib diisi"
                });
            }
            
            const customer = await DB.from("customers")
                .where("id", id)
                .first();
            
            if (!customer) {
                return response.status(404).json({
                    error: "Pelanggan tidak ditemukan"
                });
            }
            
            // Check if phone number already exists (excluding current customer)
            const existingCustomer = await DB.from("customers")
                .where("phone", phone.trim())
                .whereNot("id", id)
                .first();
            
            if (existingCustomer) {
                return response.status(422).json({
                    error: "Nomor telepon sudah digunakan oleh pelanggan lain"
                });
            }
            
            await DB.table("customers")
                .where("id", id)
                .update({
                    name: name.trim(),
                    phone: phone.trim(),
                    address: address?.trim() || null,
                    updated_at: Date.now()
                });
            
            return response.redirect("/customers?success=Data pelanggan berhasil diperbarui");
        } catch (error) {
            console.error('Error updating customer:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memperbarui data pelanggan"
            });
        }
    }

    public async destroy(request: Request, response: Response) {
        try {
            const { id } = request.params;

            const customer = await DB.from("customers")
                .where("id", id)
                .first();

            if (!customer) {
                return response.status(404).json({
                    error: "Pelanggan tidak ditemukan"
                });
            }

            // Get vehicle count for response message
            const vehicleCountResult = await DB.from("vehicles")
                .where("customer_id", id)
                .count('* as total')
                .first();

            const vehicleCount = Number((vehicleCountResult as any).total || 0);

            // Use database transaction for cascade delete
            await DB.transaction(async (trx) => {
                // Enable foreign key constraints (important for SQLite)
                await trx.raw('PRAGMA foreign_keys = ON');

                // Delete customer - foreign key constraints will handle cascade
                const deletedRows = await trx.table("customers")
                    .where("id", id)
                    .delete();

                if (deletedRows === 0) {
                    throw new Error("Customer not found or already deleted");
                }
            });

            // Prepare success message based on vehicle count
            let message = "Pelanggan berhasil dihapus";
            if (vehicleCount > 0) {
                message = `Pelanggan berhasil dihapus beserta ${vehicleCount} kendaraan yang terkait`;
            }

            return response.status(200).json({
                success: true,
                message: message,
                data: {
                    id,
                    deletedVehicles: vehicleCount
                }
            });
        } catch (error) {
            console.error('Error deleting customer:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menghapus pelanggan"
            });
        }
    }
}

export default new CustomerController();
