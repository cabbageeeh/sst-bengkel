import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('service_records', function (table) {
        table.uuid('id').primary().notNullable();
        table.uuid('vehicle_id').notNullable();
        table.bigInteger('service_date').notNullable();
        table.text('description').notNullable();
        table.integer('mileage');
        table.decimal('cost', 12, 2);
        table.text('notes');
        table.bigInteger("created_at").notNullable();
        table.bigInteger("updated_at").notNullable();
        
        // Foreign key constraint
        table.foreign('vehicle_id').references('id').inTable('vehicles').onDelete('CASCADE');
        
        // Indexes for better performance
        table.index(['vehicle_id']);
        table.index(['service_date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('service_records');
}
