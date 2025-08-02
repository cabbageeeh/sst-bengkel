import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('invoices', function (table) {
        table.uuid('id').primary().notNullable();
        table.uuid('spk_id').notNullable();
        table.string('invoice_number', 50).notNullable().unique();
        table.decimal('subtotal', 12, 2).notNullable();
        table.decimal('tax_amount', 12, 2).defaultTo(0);
        table.decimal('discount_amount', 12, 2).defaultTo(0);
        table.decimal('total_amount', 12, 2).notNullable();
        table.enum('status', ['draft', 'sent', 'paid', 'cancelled']).defaultTo('draft');
        table.bigInteger('invoice_date').notNullable();
        table.bigInteger('due_date');
        table.bigInteger('paid_date');
        table.text('notes');
        table.bigInteger("created_at").notNullable();
        table.bigInteger("updated_at").notNullable();
        
        // Foreign key constraint
        table.foreign('spk_id').references('id').inTable('spk').onDelete('CASCADE');
        
        // Indexes for better performance
        table.index(['spk_id']);
        table.index(['invoice_number']);
        table.index(['status']);
        table.index(['invoice_date']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('invoices');
}
