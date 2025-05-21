import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { deepseekService } from '../../services/deepseek.service';
import './Dashboard.css';

const StudentDashboard = () => {
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
        if (!chatMessage.trim() || isProcessing) return;

        const userMessage = {
            type: 'user',
            content: chatMessage,
            timestamp: new Date().toLocaleTimeString()
        };

        setChatHistory(prev => [...prev, userMessage]);
        setChatMessage('');
        setIsProcessing(true);

        try {
            const response = await deepseekService.sendMessage(chatMessage);
            const aiMessage = {
                type: 'ai',
                content: response,
                timestamp: new Date().toLocaleTimeString()
            };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                type: 'error',
                content: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo.',
                timestamp: new Date().toLocaleTimeString()
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
                    <h2>EDUIA</h2>
                    <p>Panel del Estudiante</p>
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
                            Mis Asignaturas
                        </button>
                    </li>
                    <li>
                        <button 
                            className={activeTab === 'progress' ? 'active' : ''}
                            onClick={() => setActiveTab('progress')}
                        >
                            Progreso
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
                        <h2>Bienvenido, {user?.name}</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>Asignaturas Activas</h4>
                                <p>3</p>
                            </div>
                            <div className="stat-card">
                                <h4>Próximas Evaluaciones</h4>
                                <p>2</p>
                            </div>
                            <div className="stat-card">
                                <h4>Promedio General</h4>
                                <p>8.5</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="chat-section">
                        <h2>Asistente IA - DeepSeek</h2>
                        <div className="chat-container">
                            <div className="chat-main">
                                <div className="chat-messages">
                                    {chatHistory.length === 0 && (
                                        <div className="welcome-message">
                                            <h4>¡Bienvenido al Asistente IA!</h4>
                                            <p>Puedo ayudarte con:</p>
                                            <ul>
                                                <li>Resolver dudas sobre tus asignaturas</li>
                                                <li>Explicar conceptos difíciles</li>
                                                <li>Proporcionar ejemplos prácticos</li>
                                                <li>Ayudarte con ejercicios</li>
                                            </ul>
                                        </div>
                                    )}
                                    {chatHistory.map((message, index) => (
                                        <div key={index} className={`message ${message.type}`}>
                                            <p>{message.content}</p>
                                            <span className="message-time">{message.timestamp}</span>
                                        </div>
                                    ))}
                                </div>
                                <form className="chat-input" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Escribe tu mensaje..."
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
                        <h2>Mis Asignaturas</h2>
                        <div className="subjects-grid">
                            <div className="subject-card">
                                <h4>Matemáticas</h4>
                                <p>Profesor: Dr. García</p>
                                <button>Ver Detalles</button>
                            </div>
                            <div className="subject-card">
                                <h4>Física</h4>
                                <p>Profesor: Dra. Martínez</p>
                                <button>Ver Detalles</button>
                            </div>
                            <div className="subject-card">
                                <h4>Programación</h4>
                                <p>Profesor: Dr. Rodríguez</p>
                                <button>Ver Detalles</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="progress-section">
                        <h2>Mi Progreso</h2>
                        <div className="progress-grid">
                            <div className="progress-card">
                                <h4>Matemáticas</h4>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '85%' }}></div>
                                </div>
                                <p>85%</p>
                            </div>
                            <div className="progress-card">
                                <h4>Física</h4>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '75%' }}></div>
                                </div>
                                <p>75%</p>
                            </div>
                            <div className="progress-card">
                                <h4>Programación</h4>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '90%' }}></div>
                                </div>
                                <p>90%</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard; 