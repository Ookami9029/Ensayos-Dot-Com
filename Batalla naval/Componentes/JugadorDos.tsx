import React from 'react';
import { Board, GamePhase } from '../App';

const BOARD_SIZE = 6;
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SHIP_SIZES = [3, 4, 5];

interface JugadorDosProps {
    phase: GamePhase;
    turn: 1 | 2;
    board2: Board;
    attacks2: Board;
    attacks1: Board; // Necesario para combinar los impactos del rival al finalizar
    orientation: 'horizontal' | 'vertical';
    setOrientation: (o: 'horizontal' | 'vertical') => void;
    onPlaceShip: (row: number, col: number) => void;
    onResetSetup: () => void;
    onConfirmSetup: () => void;
    onAttack: (row: number, col: number) => void;
    shipIndex2: number;
}

export default function JugadorDos({
    phase,
    turn,
    board2,
    attacks2,
    attacks1,
    orientation,
    setOrientation,
    onPlaceShip,
    onResetSetup,
    onConfirmSetup,
    onAttack,
    shipIndex2
}: JugadorDosProps) {

    // ==========================================
    // LÓGICA DE VISUALIZACIÓN DEL TABLERO
    // ==========================================
    const getDisplayBoard = () => {
        if (phase === 'setupP2') return board2;
        if (phase === 'playing') return attacks2;
        if (phase === 'gameover') {
            return board2.map((row, r) => 
                row.map((cell, c) => {
                    if (attacks1[r][c] === 'hit') return 'hit';
                    if (attacks1[r][c] === 'miss') return 'miss';
                    return cell;
                })
            );
        }
        return board2;
    };

    const activeBoard = getDisplayBoard();

    const handleCellClick = (rIdx: number, cIdx: number) => {
        if (phase === 'setupP2') {
            onPlaceShip(rIdx, cIdx);
        } else if (phase === 'playing' && turn === 2) {
            onAttack(rIdx, cIdx);
        }
    };

    return (
        <div style={{ 
            width: '50%', 
            height: '100%', 
            padding: '20px', 
            boxSizing: 'border-box',
            backgroundColor: (phase === 'setupP1' || phase === 'blindfold1') ? '#1e293b' : '#f8fafc',
            color: (phase === 'setupP1' || phase === 'blindfold1') ? '#ffffff' : '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
            position: 'relative'
        }}>
            {/* Pantalla ciega local si aún le toca configurar al Jugador 1 */}
            {(phase === 'setupP1' || phase === 'blindfold1') && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                    <h2>🔒 Esperando al Jugador 2</h2>
                    <p>El Jugador 1 está configurando su tablero o la computadora está bloqueada por seguridad.</p>
                </div>
            )}

            <h2>Tablero - Jugador 2 {phase === 'gameover' && '(Revelado)'}</h2>

            {/* Controles de configuración */}
            {phase === 'setupP2' && (
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button 
                        onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                        style={{ padding: '8px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Orientación: {orientation.toUpperCase()}
                    </button>

                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {shipIndex2 < 3 ? `Barco actual: Tamaño ${SHIP_SIZES[shipIndex2]}` : '¡3 Barcos colocados!'}
                    </span>

                    <button 
                        onClick={onResetSetup}
                        style={{ padding: '8px 14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Reiniciar
                    </button>

                    {shipIndex2 >= SHIP_SIZES.length && (
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
                <p style={{ fontWeight: 'bold', color: turn === 2 ? '#2563eb' : '#64748b' }}>
                    {turn === 2 ? '🎯 ¡Es tu turno de atacar!' : '⏳ Esperando al Jugador 1...'}
                </p>
            )}

            {/* Cuadrícula de 6x6 con celdas de 90px */}
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