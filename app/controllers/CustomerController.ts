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
                    .orWhere('phone', 'like', `%${search}%`)
                    .orWhere('email', 'like', `%${search}%`);
            });
        }
        
        // Get total count
        const countQuery = query.clone();
        const totalResult = await countQuery.count('* as total').first();
        const totalItems = Number((totalResult as any)?.total || 0);

        // Get paginated results
        const customers = await query
            .orderBy('created_at', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

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
            const { name, phone, email, address } = await request.json();
            
            // Validation
            if (!name || name.trim() === '') {
                return response.status(422).json({
                    error: "Nama pelanggan wajib diisi"
                });
            }
            
            const customerId = randomUUID();
            const now = Date.now();
            
            await DB.table("customers").insert({
                id: customerId,
                name: name.trim(),
                phone: phone?.trim() || null,
                email: email?.trim() || null,
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
            const { name, phone, email, address } = await request.json();
            
            // Validation
            if (!name || name.trim() === '') {
                return response.status(422).json({
                    error: "Nama pelanggan wajib diisi"
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
            
            await DB.table("customers")
                .where("id", id)
                .update({
                    name: name.trim(),
                    phone: phone?.trim() || null,
                    email: email?.trim() || null,
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
            
            // Check if customer has vehicles
            const vehicleCountResult = await DB.from("vehicles")
                .where("customer_id", id)
                .count('* as total')
                .first();

            if (vehicleCountResult && Number((vehicleCountResult as any).total || 0) > 0) {
                return response.status(422).json({
                    error: "Tidak dapat menghapus pelanggan yang masih memiliki kendaraan"
                });
            }
            
            await DB.table("customers")
                .where("id", id)
                .delete();
            
            return response.redirect("/customers?success=Pelanggan berhasil dihapus");
        } catch (error) {
            console.error('Error deleting customer:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menghapus pelanggan"
            });
        }
    }
}

export default new CustomerController();
