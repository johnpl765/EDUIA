import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { deepseekService } from '../../services/deepseek.service';
import './Dashboard.css';

const ProfessorDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Error al cargar el usuario:', error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        // Agregar mensaje del usuario al historial
        const userMessage = {
            type: 'user',
            content: chatMessage,
            timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [...prev, userMessage]);
        setChatMessage('');
        setIsProcessing(true);

        try {
            // Llamar a la API de DeepSeek
            const response = await deepseekService.sendMessage(chatMessage);
            
            const aiResponse = {
                type: 'ai',
                content: response,
                timestamp: new Date().toLocaleTimeString()
            };
            setChatHistory(prev => [...prev, aiResponse]);
        } catch (error) {
            // Agregar mensaje de error al historial
            const errorMessage = {
                type: 'ai',
                content: error.message || 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo.',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="nav-header">
                    <h2>Panel del Profesor</h2>
                    {user && <p>Bienvenido, {user.user_metadata.full_name}</p>}
                </div>
                <ul className="nav-menu">
                    <li>
                        <button 
                            className={activeTab === 'dashboard' ? 'active' : ''} 
                            onClick={() => setActiveTab('dashboard')}
                        >
                            Dashboard
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'chat' ? 'active' : ''} 
                            onClick={() => setActiveTab('chat')}
                        >
                            Asistente IA
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'subjects' ? 'active' : ''} 
                            onClick={() => setActiveTab('subjects')}
                        >
                            Materias
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'settings' ? 'active' : ''} 
                            onClick={() => setActiveTab('settings')}
                        >
                            Configuración
                        </button>
                    </li>
                </ul>
                <button className="logout-button" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </nav>

            <main className="dashboard-content">
                {activeTab === 'dashboard' && (
                    <div className="dashboard-overview">
                        <h3>Resumen</h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>Materias Activas</h4>
                                <p>3</p>
                            </div>
                            <div className="stat-card">
                                <h4>Estudiantes</h4>
                                <p>45</p>
                            </div>
                            <div className="stat-card">
                                <h4>Consultas IA</h4>
                                <p>12</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="chat-section">
                        <h3>Asistente IA - DeepSeek</h3>
                        <div className="chat-container">
                            <div className="chat-main">
                                <div className="chat-messages">
                                    {chatHistory.length === 0 && (
                                        <div className="welcome-message">
                                            <h4>Bienvenido al Asistente IA</h4>
                                            <p>Puedo ayudarte con:</p>
                                            <ul>
                                                <li>Creación de contenido educativo</li>
                                                <li>Generación de ejercicios y problemas</li>
                                                <li>Explicaciones de conceptos complejos</li>
                                                <li>Ideas para actividades en clase</li>
                                            </ul>
                                        </div>
                                    )}
                                    {chatHistory.map((message, index) => (
                                        <div key={index} className={`message ${message.type} ${message.isError ? 'error' : ''}`}>
                                            <p>{message.content}</p>
                                            <span className="message-time">{message.timestamp}</span>
                                        </div>
                                    ))}
                                    {isProcessing && (
                                        <div className="message ai">
                                            <p>Procesando...</p>
                                        </div>
                                    )}
                                </div>
                                <form onSubmit={handleSendMessage} className="chat-input">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Escribe tu pregunta para el asistente IA..."
                                        disabled={isProcessing}
                                    />
                                    <button type="submit" disabled={isProcessing}>
                                        {isProcessing ? 'Enviando...' : 'Enviar'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'subjects' && (
                    <div className="subjects-section">
                        <h3>Mis Materias</h3>
                        <div className="subjects-grid">
                            <div className="subject-card">
                                <h4>Matemáticas</h4>
                                <p>30 estudiantes</p>
                                <button>Ver Detalles</button>
                            </div>
                            <div className="subject-card">
                                <h4>Física</h4>
                                <p>25 estudiantes</p>
                                <button>Ver Detalles</button>
                            </div>
                            <div className="subject-card">
                                <h4>Química</h4>
                                <p>20 estudiantes</p>
                                <button>Ver Detalles</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <h3>Configuración</h3>
                        <div className="settings-form">
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <input 
                                    type="text" 
                                    defaultValue={user?.user_metadata.full_name || ''} 
                                    readOnly
                                />
                            </div>
                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    defaultValue={user?.email || ''} 
                                    readOnly
                                />
                            </div>
                            <button className="save-button">Guardar Cambios</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfessorDashboard; 