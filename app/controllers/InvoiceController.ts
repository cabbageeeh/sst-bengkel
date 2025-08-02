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

            let query = DB.from("invoices")
                .select(
                    "invoices.*",
                    "spk.spk_number",
                    "vehicles.license_plate",
                    "customers.name as customer_name"
                )
                .leftJoin("spk", "invoices.spk_id", "spk.id")
                .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
                .leftJoin("customers", "vehicles.customer_id", "customers.id");

            if (search) {
                query = query.where(function() {
                    this.where("invoices.invoice_number", "like", `%${search}%`)
                        .orWhere("spk.spk_number", "like", `%${search}%`)
                        .orWhere("customers.name", "like", `%${search}%`);
                });
            }

            if (status) {
                query = query.where("invoices.status", status);
            }

            const totalItems = await query.clone().count("* as count").first();
            const totalPages = Math.ceil((totalItems?.count as number) / limit);

            const invoices = await query
                .orderBy("invoices.created_at", "desc")
                .limit(limit)
                .offset(offset);

            return response.inertia("invoices/index", {
                invoices,
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
            console.error('Error fetching invoices:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data invoice"
            });
        }
    }

    public async create(request: Request, response: Response) {
        try {
            // Get completed SPKs that don't have invoices yet
            const availableSPKs = await DB.from("spk")
                .select(
                    "spk.*",
                    "vehicles.license_plate",
                    "customers.name as customer_name"
                )
                .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .leftJoin("invoices", "spk.id", "invoices.spk_id")
                .where("spk.status", "completed")
                .whereNull("invoices.id")
                .orderBy("spk.completion_date", "desc");

            return response.inertia("invoices/create", {
                availableSPKs
            });
        } catch (error) {
            console.error('Error loading invoice create page:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memuat halaman"
            });
        }
    }

    public async store(request: Request, response: Response) {
        try {
            const {
                spk_id,
                tax_amount,
                discount_amount,
                notes
            } = request.body;

            // Validate required fields
            if (!spk_id) {
                return response.status(400).json({
                    error: "SPK harus dipilih"
                });
            }

            // Get SPK details and calculate totals
            const spk = await DB.from("spk")
                .where("id", spk_id)
                .first();

            if (!spk) {
                return response.status(404).json({
                    error: "SPK tidak ditemukan"
                });
            }

            // Calculate totals
            const subtotal = parseFloat(spk.actual_cost) || 0;
            const taxAmt = parseFloat(tax_amount) || 0;
            const discountAmt = parseFloat(discount_amount) || 0;
            const totalAmount = subtotal + taxAmt - discountAmt;

            // Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber();
            const now = Date.now();

            const invoiceData = {
                id: uuidv4(),
                spk_id,
                invoice_number: invoiceNumber,
                subtotal,
                tax_amount: taxAmt,
                discount_amount: discountAmt,
                total_amount: totalAmount,
                status: 'draft',
                invoice_date: now,
                notes,
                created_at: now,
                updated_at: now
            };

            await DB.from("invoices").insert(invoiceData);

            return response.redirect("/invoices?success=Invoice berhasil dibuat");
        } catch (error) {
            console.error('Error creating invoice:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat membuat invoice"
            });
        }
    }

    public async show(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const invoice = await DB.from("invoices")
                .select(
                    "invoices.*",
                    "spk.spk_number",
                    "spk.service_description",
                    "vehicles.license_plate",
                    "vehicles.brand",
                    "vehicles.model",
                    "customers.name as customer_name",
                    "customers.phone as customer_phone",
                    "customers.email as customer_email",
                    "customers.address as customer_address"
                )
                .leftJoin("spk", "invoices.spk_id", "spk.id")
                .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .where("invoices.id", id)
                .first();
            
            if (!invoice) {
                return response.status(404).json({
                    error: "Invoice tidak ditemukan"
                });
            }

            // Get invoice items
            const invoiceItems = await DB.from("invoice_items")
                .where("invoice_id", id)
                .orderBy('created_at');
            
            return response.inertia("invoices/show", {
                invoice,
                invoiceItems
            });
        } catch (error) {
            console.error('Error fetching invoice:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data invoice"
            });
        }
    }

    public async edit(request: Request, response: Response) {
        try {
            const { id } = request.params;
            
            const invoice = await DB.from("invoices")
                .where("id", id)
                .first();
            
            if (!invoice) {
                return response.status(404).json({
                    error: "Invoice tidak ditemukan"
                });
            }

            // Get SPK details
            const spk = await DB.from("spk")
                .select(
                    "spk.*",
                    "vehicles.license_plate",
                    "customers.name as customer_name"
                )
                .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
                .leftJoin("customers", "vehicles.customer_id", "customers.id")
                .where("spk.id", invoice.spk_id)
                .first();
            
            return response.inertia("invoices/edit", {
                invoice,
                spk
            });
        } catch (error) {
            console.error('Error loading invoice edit page:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memuat halaman"
            });
        }
    }

    public async update(request: Request, response: Response) {
        try {
            const { id } = request.params;
            const {
                tax_amount,
                discount_amount,
                status,
                notes
            } = request.body;

            // Get current invoice to recalculate total
            const currentInvoice = await DB.from("invoices")
                .where("id", id)
                .first();

            if (!currentInvoice) {
                return response.status(404).json({
                    error: "Invoice tidak ditemukan"
                });
            }

            const subtotal = parseFloat(currentInvoice.subtotal);
            const taxAmt = parseFloat(tax_amount) || 0;
            const discountAmt = parseFloat(discount_amount) || 0;
            const totalAmount = subtotal + taxAmt - discountAmt;

            const updateData = {
                tax_amount: taxAmt,
                discount_amount: discountAmt,
                total_amount: totalAmount,
                status,
                notes,
                updated_at: Date.now()
            };

            // Set paid_date if status is paid
            if (status === 'paid' && currentInvoice.status !== 'paid') {
                updateData.paid_date = Date.now();
            }

            const updated = await DB.from("invoices")
                .where("id", id)
                .update(updateData);

            if (!updated) {
                return response.status(404).json({
                    error: "Invoice tidak ditemukan"
                });
            }

            return response.redirect("/invoices?success=Invoice berhasil diperbarui");
        } catch (error) {
            console.error('Error updating invoice:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat memperbarui invoice"
            });
        }
    }

    public async destroy(request: Request, response: Response) {
        try {
            const { id } = request.params;

            const deleted = await DB.from("invoices")
                .where("id", id)
                .del();

            if (!deleted) {
                return response.status(404).json({
                    error: "Invoice tidak ditemukan"
                });
            }

            return response.redirect("/invoices?success=Invoice berhasil dihapus");
        } catch (error) {
            console.error('Error deleting invoice:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat menghapus invoice"
            });
        }
    }

    private async generateInvoiceNumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        // Get the last invoice number for this month
        const lastInvoice = await DB.from("invoices")
            .where("invoice_number", "like", `INV-${year}${month}%`)
            .orderBy("invoice_number", "desc")
            .first();

        let sequence = 1;
        if (lastInvoice) {
            const lastSequence = parseInt(lastInvoice.invoice_number.split('-')[2]);
            sequence = lastSequence + 1;
        }

        return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
    }
}

export default new Controller();
