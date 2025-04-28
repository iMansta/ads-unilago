const fs = require('fs');
const path = require('path');

// Função para simular upload para S3
const uploadToS3 = async file => {
    try {
        // Por enquanto, apenas move o arquivo para uma pasta local
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, file.buffer);

        return {
            url: `/uploads/${fileName}`,
            key: fileName,
        };
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        throw error;
    }
};

// Função para simular deleção do S3
const deleteFromS3 = async key => {
    try {
        const filePath = path.join(__dirname, '../uploads', key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return true;
    } catch (error) {
        console.error('Erro ao deletar arquivo:', error);
        throw error;
    }
};

module.exports = {
    uploadToS3,
    deleteFromS3,
};
