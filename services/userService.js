const User = require('../models/User');

class UserService {
    // Atualizar status do usuário
    static async updateUserStatus(userId, status, socketId = null) {
        try {
            const updateData = {
                status,
                lastSeen: new Date()
            };

            if (socketId) {
                updateData.socketId = socketId;
            }

            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select('-password');

            return user;
        } catch (error) {
            throw new Error(`Erro ao atualizar status do usuário: ${error.message}`);
        }
    }

    // Obter usuário por ID
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId)
                .select('-password')
                .populate('friends', 'name email avatar status');
            return user;
        } catch (error) {
            throw new Error(`Erro ao obter usuário: ${error.message}`);
        }
    }

    // Obter usuários online
    static async getOnlineUsers() {
        try {
            const users = await User.find({ status: 'online' })
                .select('name email avatar status lastSeen')
                .sort({ lastSeen: -1 });
            return users;
        } catch (error) {
            throw new Error(`Erro ao obter usuários online: ${error.message}`);
        }
    }

    // Atualizar lastSeen
    static async updateLastSeen(userId) {
        try {
            await User.findByIdAndUpdate(userId, {
                lastSeen: new Date()
            });
        } catch (error) {
            throw new Error(`Erro ao atualizar lastSeen: ${error.message}`);
        }
    }

    // Obter dados públicos do usuário
    static async getPublicUserData(userId) {
        try {
            const user = await User.findById(userId)
                .select('name email avatar status course registration')
                .populate('friends', 'name email avatar status');
            return user;
        } catch (error) {
            throw new Error(`Erro ao obter dados públicos: ${error.message}`);
        }
    }

    // Verificar se usuário está online
    static async isUserOnline(userId) {
        try {
            const user = await User.findById(userId)
                .select('status lastSeen');
            return user && user.status === 'online';
        } catch (error) {
            throw new Error(`Erro ao verificar status: ${error.message}`);
        }
    }
}

module.exports = UserService; 