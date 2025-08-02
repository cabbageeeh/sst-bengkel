import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('spk_items', function (table) {
        table.uuid('id').primary().notNullable();
        table.uuid('spk_id').notNullable();
        table.string('item_name', 255).notNullable();
        table.text('description');
        table.integer('quantity').defaultTo(1);
        table.decimal('unit_price', 12, 2).notNullable();
        table.decimal('total_price', 12, 2).notNullable();
        table.enum('type', ['service', 'part', 'other']).defaultTo('service');
        table.bigInteger("created_at").notNullable();
        table.bigInteger("updated_at").notNullable();
        
        // Foreign key constraint
        table.foreign('spk_id').references('id').inTable('spk').onDelete('CASCADE');
        
        // Indexes for better performance
        table.index(['spk_id']);
        table.index(['type']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('spk_items');
}
