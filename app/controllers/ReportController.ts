import { Response, Request } from "../../type";
import DB from "../services/DB";

class Controller {
    constructor() {
        this.index = this.index.bind(this);
        this.revenue = this.revenue.bind(this);
        this.services = this.services.bind(this);
        this.customers = this.customers.bind(this);
    }

    public async index(request: Request, response: Response) {
        try {
            const period = request.query.period as string || "month";
            const year = parseInt(request.query.year as string) || new Date().getFullYear();
            const month = parseInt(request.query.month as string) || new Date().getMonth() + 1;

            // Get dashboard statistics
            const stats = await this.getDashboardStats(period, year, month);
            
            // Get recent activities
            const recentActivities = await this.getRecentActivities();
            
            // Get revenue chart data
            const revenueData = await this.getRevenueData(period, year, month);
            
            // Get service statistics
            const serviceStats = await this.getServiceStats(period, year, month);

            return response.inertia("reports/index", {
                stats,
                recentActivities,
                revenueData,
                serviceStats,
                period,
                year,
                month
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil data laporan"
            });
        }
    }

    public async revenue(request: Request, response: Response) {
        try {
            const startDate = request.query.start_date as string;
            const endDate = request.query.end_date as string;
            const groupBy = request.query.group_by as string || "day";

            let query = DB.from("invoices")
                .select(
                    DB.raw("DATE(datetime(invoice_date/1000, 'unixepoch')) as date"),
                    DB.raw("SUM(total_amount) as total_amount"),
                    DB.raw("COUNT(*) as invoice_count")
                )
                .where("status", "paid");

            if (startDate) {
                query = query.where("invoice_date", ">=", new Date(startDate).getTime());
            }
            if (endDate) {
                query = query.where("invoice_date", "<=", new Date(endDate).getTime());
            }

            const revenueData = await query
                .groupBy(DB.raw("DATE(datetime(invoice_date/1000, 'unixepoch'))"))
                .orderBy("date");

            return response.inertia("reports/revenue", {
                revenueData,
                startDate,
                endDate,
                groupBy
            });
        } catch (error) {
            console.error('Error fetching revenue report:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil laporan pendapatan"
            });
        }
    }

    public async services(request: Request, response: Response) {
        try {
            const startDate = request.query.start_date as string;
            const endDate = request.query.end_date as string;
            const status = request.query.status as string;

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

            if (startDate) {
                query = query.where("spk.tanggal_masuk", ">=", new Date(startDate).getTime());
            }
            if (endDate) {
                query = query.where("spk.tanggal_masuk", "<=", new Date(endDate).getTime());
            }
            if (status) {
                query = query.where("spk.status", status);
            }

            const services = await query.orderBy("spk.tanggal_masuk", "desc");

            // Get service statistics
            const serviceStats = await DB.from("spk")
                .select(
                    "status",
                    DB.raw("COUNT(*) as count"),
                    DB.raw("AVG(actual_cost) as avg_cost"),
                    DB.raw("SUM(actual_cost) as total_cost")
                )
                .groupBy("status");

            return response.inertia("reports/services", {
                serviceData: services,
                serviceStats,
                startDate,
                endDate,
                status
            });
        } catch (error) {
            console.error('Error fetching services report:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil laporan servis"
            });
        }
    }

    public async customers(request: Request, response: Response) {
        try {
            const sortBy = request.query.sort_by as string || "total_spent";
            const order = request.query.order as string || "desc";

            // Get customer statistics
            const customerStats = await DB.from("customers")
                .select(
                    "customers.*",
                    DB.raw("COUNT(DISTINCT vehicles.id) as vehicle_count"),
                    DB.raw("COUNT(DISTINCT spk.id) as service_count"),
                    DB.raw("COALESCE(SUM(invoices.total_amount), 0) as total_spent"),
                    DB.raw("MAX(spk.tanggal_masuk) as last_service_date")
                )
                .leftJoin("vehicles", "customers.id", "vehicles.customer_id")
                .leftJoin("spk", "vehicles.id", "spk.vehicle_id")
                .leftJoin("invoices", "spk.id", "invoices.spk_id")
                .where("invoices.status", "paid")
                .groupBy("customers.id")
                .orderBy(sortBy, order);

            return response.inertia("reports/customers", {
                customerData: customerStats,
                sortBy,
                order
            });
        } catch (error) {
            console.error('Error fetching customers report:', error);
            return response.status(500).json({
                error: "Terjadi kesalahan saat mengambil laporan pelanggan"
            });
        }
    }

    private async getDashboardStats(period: string, year: number, month: number) {
        const now = Date.now();
        let startDate: number;
        let endDate: number = now;

        if (period === "month") {
            startDate = new Date(year, month - 1, 1).getTime();
            endDate = new Date(year, month, 0, 23, 59, 59).getTime();
        } else if (period === "year") {
            startDate = new Date(year, 0, 1).getTime();
            endDate = new Date(year, 11, 31, 23, 59, 59).getTime();
        } else {
            // Default to current month
            startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        }

        // Total customers
        const totalCustomers = await DB.from("customers").count("* as count").first();
        
        // Total vehicles
        const totalVehicles = await DB.from("vehicles").count("* as count").first();
        
        // Active SPKs
        const activeSPKs = await DB.from("spk")
            .whereIn("status", ["draft", "in_progress"])
            .count("* as count")
            .first();
        
        // Revenue for period
        const revenue = await DB.from("invoices")
            .where("status", "paid")
            .whereBetween("invoice_date", [startDate, endDate])
            .sum("total_amount as total")
            .first();

        // Completed services for period
        const completedServices = await DB.from("spk")
            .where("status", "completed")
            .whereBetween("tanggal_keluar", [startDate, endDate])
            .count("* as count")
            .first();

        return {
            totalCustomers: totalCustomers?.count || 0,
            totalVehicles: totalVehicles?.count || 0,
            activeSPKs: activeSPKs?.count || 0,
            revenue: revenue?.total || 0,
            completedServices: completedServices?.count || 0
        };
    }

    private async getRecentActivities() {
        // Get recent SPKs
        const recentSPKs = await DB.from("spk")
            .select(
                "spk.id",
                "spk.spk_number",
                "spk.status",
                "spk.created_at",
                "vehicles.license_plate",
                "customers.name as customer_name"
            )
            .leftJoin("vehicles", "spk.vehicle_id", "vehicles.id")
            .leftJoin("customers", "vehicles.customer_id", "customers.id")
            .orderBy("spk.created_at", "desc")
            .limit(10);

        return recentSPKs.map(spk => ({
            ...spk,
            type: "spk",
            description: `SPK ${spk.spk_number} - ${spk.license_plate}`
        }));
    }

    private async getRevenueData(period: string, year: number, month: number) {
        let groupByFormat: string;
        let startDate: number;
        let endDate: number;

        if (period === "month") {
            groupByFormat = "DATE(datetime(invoice_date/1000, 'unixepoch'))";
            startDate = new Date(year, month - 1, 1).getTime();
            endDate = new Date(year, month, 0, 23, 59, 59).getTime();
        } else {
            groupByFormat = "strftime('%Y-%m', datetime(invoice_date/1000, 'unixepoch'))";
            startDate = new Date(year, 0, 1).getTime();
            endDate = new Date(year, 11, 31, 23, 59, 59).getTime();
        }

        return await DB.from("invoices")
            .select(
                DB.raw(`${groupByFormat} as period`),
                DB.raw("SUM(total_amount) as revenue"),
                DB.raw("COUNT(*) as invoice_count")
            )
            .where("status", "paid")
            .whereBetween("invoice_date", [startDate, endDate])
            .groupBy(DB.raw(groupByFormat))
            .orderBy("period");
    }

    private async getServiceStats(period: string, year: number, month: number) {
        let startDate: number;
        let endDate: number;

        if (period === "month") {
            startDate = new Date(year, month - 1, 1).getTime();
            endDate = new Date(year, month, 0, 23, 59, 59).getTime();
        } else {
            startDate = new Date(year, 0, 1).getTime();
            endDate = new Date(year, 11, 31, 23, 59, 59).getTime();
        }

        return await DB.from("spk")
            .select(
                "status",
                DB.raw("COUNT(*) as count")
            )
            .whereBetween("created_at", [startDate, endDate])
            .groupBy("status");
    }
}

export default new Controller();
