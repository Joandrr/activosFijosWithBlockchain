# 1. Base de datos PostgreSQL
cd backend
npm run migration      # Crea las tablas
npm run seed           # Pobla datos iniciales + admin

# 2. Backend
npm run dev            # http://localhost:3000

# 3. Frontend (otra terminal)
cd frontend
npm run dev            # http://localhost:5173

# 4. Blockchain
cd blockchain
npm run compile        # Compilar contratos Solidity

Usuario admin por defecto: admin@ficct.edu.bo / admin123