import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTcAppAccountTable1734031200000
  implements MigrationInterface
{
  name = 'CreateTcAppAccountTable1734031200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'TC_APP_ACCOUNT'
    `);

    if (tableExists[0]?.count > 0) {
      console.log('TC_APP_ACCOUNT table already exists');
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'TC_APP_ACCOUNT',
        columns: [
          {
            name: 'id',
            type: 'nvarchar',
            length: '50',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'username',
            type: 'nvarchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'nvarchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'nvarchar',
            length: '20',
            default: "'regular'",
            isNullable: false,
          },
          {
            name: 'full_name',
            type: 'nvarchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'dept_no',
            type: 'nvarchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'dept_name',
            type: 'nvarchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'bit',
            default: 1,
            isNullable: false,
          },
          {
            name: 'last_login_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime2',
            default: 'GETDATE()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime2',
            default: 'GETDATE()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IDX_TC_APP_ACCOUNT_USERNAME ON TC_APP_ACCOUNT (username)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_TC_APP_ACCOUNT_IS_ACTIVE ON TC_APP_ACCOUNT (is_active)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('TC_APP_ACCOUNT');
  }
}
