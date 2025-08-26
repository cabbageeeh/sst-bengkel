import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('customers', function (table) {
        // Drop the email index first
        table.dropIndex(['email']);
        
        // Drop the email column
        table.dropColumn('email');
        
        // Make phone column unique and not null
        table.string('phone', 20).notNullable().unique().alter();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('customers', function (table) {
        // Remove unique constraint from phone and make it nullable again
        table.string('phone', 20).alter();
        
        // Add email column back
        table.string('email', 255);
        
        // Add indexes back
        table.index(['phone']);
        table.index(['email']);
    });
}