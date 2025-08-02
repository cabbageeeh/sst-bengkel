import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('spk', function (table) {
        table.uuid('id').primary().notNullable();
        table.uuid('vehicle_id').notNullable();
        table.string('spk_number', 50).notNullable().unique();
        table.text('service_description').notNullable();
        table.decimal('estimated_cost', 12, 2);
        table.decimal('actual_cost', 12, 2);
        table.enum('status', ['draft', 'in_progress', 'completed', 'cancelled']).defaultTo('draft');
        table.bigInteger('start_date');
        table.bigInteger('completion_date');
        table.text('notes');
        table.text('signature_data'); // For digital signature
        table.bigInteger("created_at").notNullable();
        table.bigInteger("updated_at").notNullable();
        
        // Foreign key constraint
        table.foreign('vehicle_id').references('id').inTable('vehicles').onDelete('CASCADE');
        
        // Indexes for better performance
        table.index(['vehicle_id']);
        table.index(['spk_number']);
        table.index(['status']);
        table.index(['start_date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('spk');
}
