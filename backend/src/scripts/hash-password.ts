import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Loan } from '../loan/loan.entity';

async function hashExistingPasswords() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'admin',
    database: 'loan_db',
    entities: [User, Loan],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Conectado ao banco de dados');

  const userRepo = dataSource.getRepository(User);
  const users = await userRepo.find();

  for (const user of users) {
    // Verifica se a senha já é um hash bcrypt (começa com $2)
    if (!user.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await userRepo.update(user.id, { password: hashedPassword });
      console.log(`Senha do usuário ${user.email} atualizada com hash`);
    } else {
      console.log(`Senha do usuário ${user.email} já está hasheada`);
    }
  }

  await dataSource.destroy();
  console.log('Concluído!');
}

hashExistingPasswords().catch(console.error);

