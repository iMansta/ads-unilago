const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar o armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Criar o diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configurar o filtro de arquivos
const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens, vídeos e documentos
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado'), false);
  }
};

// Configurar limites
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB por arquivo
  files: 10 // Máximo de 10 arquivos por upload
};

// Criar o middleware de upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

module.exports = upload; 