import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('customers', function (table) {
        table.uuid('id').primary().notNullable();
        table.string('name', 255).notNullable();
        table.string('phone', 20);
        table.string('email', 255);
        table.text('address');
        table.bigInteger("created_at").notNullable();
        table.bigInteger("updated_at").notNullable();
        
        // Indexes for better performance
        table.index(['name']);
        table.index(['phone']);
        table.index(['email']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('customers');
}
