iniciar la bd primero con la migracion ocupando prisma + postgresql

Abrir pgadmin
CREATE DATABASE activosFICCT;

1ra opcion
psql -U postgres -d activosFICCT -f prisma/migrations/initialBD.sql

2da opcion
npx prisma db push
