import React from 'react';
import { Board, GamePhase } from '../App';

const BOARD_SIZE = 6;
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SHIP_SIZES = [3, 4, 5];

// Definición estricta de las propiedades (props) que recibe este componente
interface JugadorUnoProps {
    phase: GamePhase;
    turn: 1 | 2;
    board1: Board;
    attacks1: Board;
    attacks2: Board; // Necesario para combinar los impactos del rival al finalizar
    orientation: 'horizontal' | 'vertical';
    setOrientation: (o: 'horizontal' | 'vertical') => void;
    onPlaceShip: (row: number, col: number) => void;
    onResetSetup: () => void;
    onConfirmSetup: () => void;
    onAttack: (row: number, col: number) => void;
    shipIndex1: number;
}

export default function JugadorUno({
    phase,
    turn,
    board1,
    attacks1,
    attacks2,
    orientation,
    setOrientation,
    onPlaceShip,
    onResetSetup,
    onConfirmSetup,
    onAttack,
    shipIndex1
}: JugadorUnoProps) {

    // ==========================================
    // LÓGICA DE VISUALIZACIÓN DEL TABLERO
    // ==========================================
    const getDisplayBoard = () => {
        if (phase === 'setupP1') return board1; // Muestra sus barcos ocultos al configurar
        if (phase === 'playing') return attacks1; // Muestra sus disparos contra el rival durante la partida
        if (phase === 'gameover') {
            // Revelación total: Fusiona el tablero de barcos propios con los impactos del rival
            return board1.map((row, r) => 
                row.map((cell, c) => {
                    if (attacks2[r][c] === 'hit') return 'hit';
                    if (attacks2[r][c] === 'miss') return 'miss';
                    return cell; // Muestra el barco o espacio vacío original
                })
            );
        }
        return board1;
    };

    const activeBoard = getDisplayBoard();

    // Manejador de clics según la fase activa del juego
    const handleCellClick = (rIdx: number, cIdx: number) => {
        if (phase === 'setupP1') {
            onPlaceShip(rIdx, cIdx);
        } else if (phase === 'playing' && turn === 1) {
            onAttack(rIdx, cIdx);
        }
    };

    return (
        <div style={{ 
            width: '50%', 
            height: '100%', 
            borderRight: '2px solid #cbd5e1', 
            padding: '20px', 
            boxSizing: 'border-box',
            backgroundColor: phase === 'setupP2' ? '#1e293b' : '#ffffff', 
            color: phase === 'setupP2' ? '#ffffff' : '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
            position: 'relative'
        }}>
            {/* Pantalla de bloqueo local si le toca configurar al Jugador 2 */}
            {phase === 'setupP2' && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                    <h2>🔒 Turno del Jugador 2</h2>
                    <p>El Jugador 1 ya terminó. Esperando que el Jugador 2 coloque sus barcos...</p>
                </div>
            )}

            <h2>Tablero - Jugador 1 {phase === 'gameover' && '(Revelado)'}</h2>

            {/* Controles de configuración */}
            {phase === 'setupP1' && (
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button 
                        onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                        style={{ padding: '8px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Orientación: {orientation.toUpperCase()}
                    </button>

                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {shipIndex1 < 3 ? `Barco actual: Tamaño ${SHIP_SIZES[shipIndex1]}` : '¡3 Barcos colocados!'}
                    </span>

                    <button 
                        onClick={onResetSetup}
                        style={{ padding: '8px 14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Reiniciar
                    </button>

                    {shipIndex1 >= SHIP_SIZES.length && (
                        <button 
                            onClick={onConfirmSetup}
                            style={{ padding: '8px 14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            ¡Listo!
                        </button>
                    )}
                </div>
            )}

            {phase === 'playing' && (
                <p style={{ fontWeight: 'bold', color: turn === 1 ? '#2563eb' : '#64748b' }}>
                    {turn === 1 ? '🎯 ¡Es tu turno de atacar!' : '⏳ Esperando al Jugador 2...'}
                </p>
            )}

            {/* Cuadrícula de 6x6 con celdas de 90px y coordenadas de ajedrez */}
            <div style={{ 
                display: 'inline-grid', 
                gridTemplateColumns: '50px repeat(6, 90px)', 
                gridTemplateRows: '50px repeat(6, 90px)', 
                gap: '4px', 
                background: '#e2e8f0', 
                padding: '10px', 
                borderRadius: '8px',
                alignItems: 'center',
                justifyItems: 'center'
            }}>
                <div style={{ width: '50px', height: '50px' }}></div>
                {COLS.map((letter) => (
                    <div key={letter} style={{ width: '90px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', fontSize: '18px' }}>
                        {letter}
                    </div>
                ))}

                {activeBoard.map((row, rIdx) => (
                    <React.Fragment key={`row-${rIdx}`}>
                        <div style={{ width: '50px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', fontSize: '18px' }}>
                            {rIdx + 1}
                        </div>

                        {row.map((cell, cIdx) => {
                            let bg = '#ffffff';
                            let content = '';

                            if (cell === 'ship') { bg = '#10b981'; content = '🚢'; }
                            if (cell === 'hit') { bg = '#ef4444'; content = '💥'; }
                            if (cell === 'miss') { bg = '#94a3b8'; content = '💧'; }

                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    onClick={() => handleCellClick(rIdx, cIdx)}
                                    style={{
                                        width: '90px',
                                        height: '90px',
                                        backgroundColor: bg,
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '32px',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}