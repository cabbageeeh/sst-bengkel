import DB from "../services/DB";
import { Response, Request } from "../../type";
import { randomUUID } from "crypto";

class VehicleController {
    public async index(request: Request, response: Response) {
        const page = parseInt(request.query.page as string) || 1;
        const search = request.query.search as string || "";
        const customer_id = request.query.customer_id as string || "";
        const limit = 10;
        
        let query = DB.from("vehicles")
            .select(
                "vehicles.*",
                "customers.name as customer_name",
                "customers.phone as customer_phone"
            )
            .leftJoin("customers", "vehicles.customer_id", "customers.id");
        
        // Apply search
        if (search) {
            query = query.where(function() {
                this.where('vehicles.license_plate', 'like', `%${search}%`)
                    .orWhere('vehicles.brand', 'like', `%${search}%`)
                    .orWhere('vehicles.model', 'like', `%${search}%`)
                    .orWhere('customers.name', 'like', `%${search}%`);
            });
        }
        
        // Filter by customer if specified
        if (customer_id) {
            query = query.where('vehicles.customer_id', customer_id);
        }
        
        // Get total count
        const countQuery = query.clone();
        const totalResult = await countQuery.count('* as total').first();
        const totalItems = Number((totalResult as any)?.total || 0);

        // Get paginated results
        const vehicles = await query
            .orderBy('vehicles.created_at', 'desc')
            .offset((page - 1) * limit)
            .limit(limit);

        const totalPages = Math.ceil(totalItems / limit);

        // Get customers for filter dropdown
        const customers = await DB.from("customers")
            .select("id", "name")
            .orderBy("name");

        return response.inertia("vehicles/index", {
            vehicles,
            customers,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_items: totalItems,
                per_page: limit
            },
            search,
            customer_id,
            success: request.query.success || null
        });
    }

    public async create(request: Request, response: Response) {
        const customer_id = request.query.customer_id as string || "";
        
        // Get customers for dropdown
        const customers = await DB.from("customers")
            .select("id", "name", "phone")
            .orderBy("name");
        
        let selectedCustomer = null;
        if (customer_id) {
            selectedCustomer = await DB.from("customers")
                .where("id", customer_id)
                .first();
        }
        
        return response.inertia("vehicles/create", {
            customers,
            selectedCustomer
        });
    }

    public async store(request: Request, response: Response) {
        try {
            const { 
                customer_id, 
                license_plate, 
                brand, 
                model, 
                year, 
                engine_type, 
                color, 
                notes 
            } = await request.json();
            
            // Validation
            if (!customer_id || !license_plate || !brand || !model) {
                return response.status(422).json({
                    error: "Customer, plat nomor, merk, dan model wajib diisi"
                });
            }
            
            // Check if customer exists
            const customer = await DB.from("customers")
                .where("id", customer_id)
                .first();
            
            if (!customer) {
                return response.status(422).json({
                    error: "Pelanggan tidak ditemukan"
                });
            }
            
            // Check if license plate already exists
            const existingVehicle = await DB.from("vehicles")
                .where("license_plate", license_plate.trim().toUpperCase())
                .first();
            
            if (existingVehicle) {
                return response.status(422).json({
                    error: "Plat nomor sudah terdaftar"
                });
            }
            
            const vehicleId = randomUUID();
            const now = Date.now();
            
            await DB.table("vehicles").insert({
                id: vehicleId,
                customer_id,
                license_plate: license_plate.trim().toUpperCase(),
                brand: brand.trim(),
                model: model.trim(),
                year: year ? parseInt(year) : null,
                engine_type: engine_type?.trim() || null,
                color: color?.trim() || null,
                notes: notes?.trim() || null,
                created_at: now,
                updated_at: now
            });
            
            return response.redirect("/vehicles?success=Kendaraan berhasil ditambahkan");
        } catch (error) {
            console.error('Error creating vehicle:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menyimpan data kendaraan"
            });
        }
    }

    public async show(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const vehicle = await DB.from("vehicles")
                .select(
                    "vehicles.*",
                    "customers.name as customer_name",
                    "customers.phone as customer_phone",
                    "customers.email as customer_email",
                    "customers.address as customer_address"
                )
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .where("vehicles.id", id)
                .first();
            
            if (!vehicle) {
                return response.status(404).json({
                    error: "Kendaraan tidak ditemukan"
                });
            }
            
            // Get service records for this vehicle
            const serviceRecords = await DB.from("service_records")
                .where("vehicle_id", id)
                .orderBy('service_date', 'desc')
                .limit(10);
            
            return response.inertia("vehicles/show", {
                vehicle,
                serviceRecords
            });
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data kendaraan"
            });
        }
    }

    public async edit(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const vehicle = await DB.from("vehicles")
                .select(
                    "vehicles.*",
                    "customers.name as customer_name"
                )
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .where("vehicles.id", id)
                .first();
            
            if (!vehicle) {
                return response.status(404).json({
                    error: "Kendaraan tidak ditemukan"
                });
            }
            
            // Get customers for dropdown
            const customers = await DB.from("customers")
                .select("id", "name", "phone")
                .orderBy("name");
            
            return response.inertia("vehicles/edit", {
                vehicle,
                customers
            });
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data kendaraan"
            });
        }
    }

    public async update(request: Request, response: Response) {
        try {
            const { id } = request.params;
            const { 
                customer_id, 
                license_plate, 
                brand, 
                model, 
                year, 
                engine_type, 
                color, 
                notes 
            } = await request.json();
            
            // Validation
            if (!customer_id || !license_plate || !brand || !model) {
                return response.status(422).json({
                    error: "Customer, plat nomor, merk, dan model wajib diisi"
                });
            }
            
            const vehicle = await DB.from("vehicles")
                .where("id", id)
                .first();
            
            if (!vehicle) {
                return response.status(404).json({
                    error: "Kendaraan tidak ditemukan"
                });
            }
            
            // Check if customer exists
            const customer = await DB.from("customers")
                .where("id", customer_id)
                .first();
            
            if (!customer) {
                return response.status(422).json({
                    error: "Pelanggan tidak ditemukan"
                });
            }
            
            // Check if license plate already exists (excluding current vehicle)
            const existingVehicle = await DB.from("vehicles")
                .where("license_plate", license_plate.trim().toUpperCase())
                .whereNot("id", id)
                .first();
            
            if (existingVehicle) {
                return response.status(422).json({
                    error: "Plat nomor sudah terdaftar"
                });
            }
            
            await DB.table("vehicles")
                .where("id", id)
                .update({
                    customer_id,
                    license_plate: license_plate.trim().toUpperCase(),
                    brand: brand.trim(),
                    model: model.trim(),
                    year: year ? parseInt(year) : null,
                    engine_type: engine_type?.trim() || null,
                    color: color?.trim() || null,
                    notes: notes?.trim() || null,
                    updated_at: Date.now()
                });
            
            return response.redirect("/vehicles?success=Data kendaraan berhasil diperbarui");
        } catch (error) {
            console.error('Error updating vehicle:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memperbarui data kendaraan"
            });
        }
    }

    public async destroy(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const vehicle = await DB.from("vehicles")
                .where("id", id)
                .first();
            
            if (!vehicle) {
                return response.status(404).json({
                    error: "Kendaraan tidak ditemukan"
                });
            }
            
            // Check if vehicle has service records
            const serviceCountResult = await DB.from("service_records")
                .where("vehicle_id", id)
                .count('* as total')
                .first();

            if (serviceCountResult && Number((serviceCountResult as any).total || 0) > 0) {
                return response.status(422).json({
                    error: "Tidak dapat menghapus kendaraan yang memiliki riwayat servis"
                });
            }
            
            await DB.table("vehicles")
                .where("id", id)
                .delete();

            return response.json({
                message: "Kendaraan berhasil dihapus"
            });
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menghapus kendaraan"
            });
        }
    }

    public async search(request: Request, response: Response) {
        try {
            const { q } = request.query;
            
            if (!q || (q as string).length < 2) {
                return response.json([]);
            }
            
            const vehicles = await DB.from("vehicles")
                .select(
                    "vehicles.*",
                    "customers.name as customer_name",
                    "customers.phone as customer_phone"
                )
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .where(function() {
                    this.where('vehicles.license_plate', 'like', `%${q}%`)
                        .orWhere('vehicles.brand', 'like', `%${q}%`)
                        .orWhere('vehicles.model', 'like', `%${q}%`)
                        .orWhere('customers.name', 'like', `%${q}%`);
                })
                .limit(10);
            
            return response.json(vehicles);
        } catch (error) {
            console.error('Error searching vehicles:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mencari kendaraan"
            });
        }
    }
}

export default new VehicleController();
