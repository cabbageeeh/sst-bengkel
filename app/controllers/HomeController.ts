import { Response, Request } from "../../type";
import DB from '../services/DB';

class Controller {

    public async index (request : Request,response : Response) {
        try {
            const [customers, vehicles, active, unpaid, recentSpks] = await Promise.all([
                DB('customers').count('* as count').first(),
                DB('vehicles').count('* as count').first(),
                DB('spk').where('status', 'in_progress').count('* as count').first(),
                DB('invoices').whereIn('status', ['draft', 'sent']).count('* as count').first(),
                DB('spk').select('spk.*', 'vehicles.license_plate', 'vehicles.brand', 'vehicles.model', 'customers.name as customer_name')
                    .leftJoin('vehicles', 'spk.vehicle_id', 'vehicles.id')
                    .leftJoin('customers', 'vehicles.customer_id', 'customers.id')
                    .orderBy('spk.created_at', 'desc').limit(6)
            ]);
            return response.inertia('Landing', {
                overview: {customers:Number(customers?.count || 0), vehicles:Number(vehicles?.count || 0), active:Number(active?.count || 0), unpaid:Number(unpaid?.count || 0)},
                recentSpks
            });
        } catch (error) {
            console.error('Error loading workshop overview:', error);
            return response.status(500).json({error:'Ringkasan bengkel belum berhasil dimuat.'});
        }
    }
}

export default new Controller()
