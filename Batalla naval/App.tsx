import React, { useState } from 'react';
import JugadorUno from './Componentes/JugadorUno';
import JugadorDos from './Componentes/JugadorDos';

// ==========================================
// 1. TIPOS DE DATOS Y ESTADOS GLOBALES
// ==========================================
export type CellState = 'empty' | 'ship' | 'hit' | 'miss';
export type Board = CellState[][];

// Fases del juego: Configuración P1 -> Pantalla ciega -> Configuración P2 -> Batalla -> Fin del juego
export type GamePhase = 'setupP1' | 'blindfold1' | 'setupP2' | 'blindfold2' | 'playing' | 'gameover';

const BOARD_SIZE = 6; // Tamaño del tablero: 6x6
const SHIP_SIZES = [3, 4, 5]; // Tamaños estrictos de los barcos requeridos

// Función auxiliar: Crea una matriz de 6x6 limpia llena de celdas vacías ('empty')
const createEmptyBoard = (): Board => 
  Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('empty'));

export default function App() {
  // Estado que controla en qué fase exacta se encuentra el juego
  const [phase, setPhase] = useState<GamePhase>('setupP1');
  // Controla de quién es el turno durante la fase de ataques (1 o 2)
  const [turn, setTurn] = useState<1 | 2>(1);

  // Tableros secretos: donde cada jugador oculta la posición real de sus barcos
  const [board1, setBoard1] = useState<Board>(createEmptyBoard());
  const [board2, setBoard2] = useState<Board>(createEmptyBoard());

  // Tableros de ataques: lo que ve cada jugador al disparar al enemigo (impactos o agua)
  const [attacks1, setAttacks1] = useState<Board>(createEmptyBoard());
  const [attacks2, setAttacks2] = useState<Board>(createEmptyBoard());

  // Índices para saber qué barco toca colocar (0 = tamaño 3, 1 = tamaño 4, 2 = tamaño 5)
  const [shipIndex1, setShipIndex1] = useState<number>(0);
  const [shipIndex2, setShipIndex2] = useState<number>(0);
  
  // Orientación actual para colocar barcos ('horizontal' o 'vertical')
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Mensaje de la barra superior para guiar al usuario en pantalla
  const [message, setMessage] = useState<string>("Jugador 1: Coloca tu barco de tamaño 3");
  const [winner, setWinner] = useState<number | null>(null);

  // ==========================================
  // 2. FUNCIÓN: REINICIAR CONFIGURACIÓN
  // ==========================================
  const handleResetSetup = (player: 1 | 2) => {
    if (player === 1) {
      setBoard1(createEmptyBoard());
      setShipIndex1(0);
      setMessage("Jugador 1: Tablero reiniciado. Coloca tu barco de tamaño 3");
    } else {
      setBoard2(createEmptyBoard());
      setShipIndex2(0);
      setMessage("Jugador 2: Tablero reiniciado. Coloca tu barco de tamaño 3");
    }
  };

  // ==========================================
  // 3. LÓGICA DE COLOCACIÓN DE BARCOS
  // ==========================================
  const handlePlaceShip = (player: 1 | 2, row: number, col: number) => {
    // esta linea es una condicion resumida, loquesea=algo ? hasta aqui es al condicion despues del ? es valor si verdadero despues del : valor si falso
    const currentBoard = player === 1 ? board1 : board2;
    const currentShipIdx = player === 1 ? shipIndex1 : shipIndex2;

    // Validación de seguridad: Si ya colocó sus 3 barcos, bloquea nuevos clics
    if (currentShipIdx >= SHIP_SIZES.length) {
      setMessage(`¡Jugador ${player} ya colocó sus 3 barcos! Presiona 'Listo'.`);
      return;
    }

    const size = SHIP_SIZES[currentShipIdx];

    // Validar que el barco no se salga de los límites del tablero de 6x6
    if (orientation === 'horizontal' && col + size > BOARD_SIZE) {
      setMessage(`¡El barco de tamaño ${size} se sale del tablero horizontalmente!`);
      return;
    }
    if (orientation === 'vertical' && row + size > BOARD_SIZE) {
      setMessage(`¡El barco de tamaño ${size} se sale del tablero verticalmente!`);
      return;
    }

    // Verificar superposición de barcos
    const newBoard = currentBoard.map(r => [...r]);
    const coords: [number, number][] = [];

    for (let i = 0; i < size; i++) {
      const r = orientation === 'vertical' ? row + i : row;
      const c = orientation === 'horizontal' ? col + i : col;

      if (newBoard[r][c] === 'ship') {
        setMessage("¡Ya hay un barco en esa posición o se superponen!");
        return;
      }
      coords.push([r, c]);
    }

    // Pintar las casillas con el barco colocado
    coords.forEach(([r, c]) => {
      newBoard[r][c] = 'ship';
    });

    // Actualizar estado según el jugador correspondiente
    if (player === 1) {
      setBoard1(newBoard);
      const nextIdx = shipIndex1 + 1;
      setShipIndex1(nextIdx);
      if (nextIdx < SHIP_SIZES.length) {
        setMessage(`Jugador 1: Coloca tu barco de tamaño ${SHIP_SIZES[nextIdx]}`);
      } else {
        setMessage("¡Jugador 1 colocó sus 3 barcos! Presiona 'Listo'.");
      }
    } else {
      setBoard2(newBoard);
      const nextIdx = shipIndex2 + 1;
      setShipIndex2(nextIdx);
      if (nextIdx < SHIP_SIZES.length) {
        setMessage(`Jugador 2: Coloca tu barco de tamaño ${SHIP_SIZES[nextIdx]}`);
      } else {
        setMessage("¡Jugador 2 colocó sus 3 barcos! Presiona 'Listo'.");
      }
    }
  };

  // Confirmar fin de configuración y activar pantalla ciega (Blindfold)
  const handleConfirmSetup = (player: 1 | 2) => {
    const currentIdx = player === 1 ? shipIndex1 : shipIndex2;
    if (currentIdx < SHIP_SIZES.length) {
      setMessage("¡Debes colocar los 3 barcos antes de continuar!");
      return;
    }

    if (player === 1) {
      setPhase('blindfold1'); // Bloquea la pantalla para pasar al Jugador 2 de forma privada
      setMessage("Paso 1 completado. Cede la computadora al Jugador 2.");
    } else {
      setPhase('playing'); // Comienza la fase de ataques mutuos
      setMessage("¡Ambos jugadores listos! Comienza la batalla. Turno del Jugador 1.");
    }
  };

  // ==========================================
  // 4. LÓGICA DE ATAQUES Y CONDICIÓN DE VICTORIA
  // ==========================================
  const handleAttack = (row: number, col: number) => {
    if (phase !== 'playing') return;

    const opponentBoard = turn === 1 ? board2 : board1;
    const opponentAttacks = turn === 1 ? attacks1 : attacks2;

    // Evitar disparar dos veces en la misma coordenada
    if (opponentAttacks[row][col] !== 'empty') {
      setMessage("Ya disparaste en esta coordenada. Elige otra.");
      return;
    }

    const newAttacks = opponentAttacks.map(r => [...r]);
    let hit = false;

    // Verificar si le dio a un barco enemigo
    if (opponentBoard[row][col] === 'ship') {
      newAttacks[row][col] = 'hit';
      hit = true;
    } else {
      newAttacks[row][col] = 'miss';
    }

    if (turn === 1) setAttacks1(newAttacks);
    else setAttacks2(newAttacks);

    // Si hay impacto, revisamos si se hundió algún barco completo para ganar
    if (hit) {
      const hasWon = checkWinCondition(opponentBoard, newAttacks);
      if (hasWon) {
        setWinner(turn);
        setPhase('gameover'); // Cambia a fase final para revelar tableros
        setMessage(`¡Jugador ${turn} ha hundido un navío y gana la partida! 🏆 Tableros revelados.`);
      } else {
        setMessage(`¡Impacto! Jugador ${turn} vuelve a disparar 💥`);
      }
    } else {
      // Si falla, el turno pasa automáticamente al rival
      setTurn(turn === 1 ? 2 : 1);
      setMessage(`Agua 💧. Turno del Jugador ${turn === 1 ? 2 : 1}`);
    }
  };

// ==========================================
  // FUNCIÓN AUXILIAR: Extrae los barcos reales del tablero por sus coordenadas
  // ==========================================
  const getShipsFromBoard = (secretBoard: Board): [number, number][][] => {
    const ships: [number, number][][] = [];
    const visited = Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false));

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (secretBoard[r][c] === 'ship' && !visited[r][c]) {
          // Intentar rastrear barco en horizontal
          let hShip: [number, number][] = [];
          let tempC = c;
          while (tempC < BOARD_SIZE && secretBoard[r][tempC] === 'ship') {
            hShip.push([r, tempC]);
            tempC++;
          }

          // Intentar rastrear barco en vertical
          let vShip: [number, number][] = [];
          let tempR = r;
          while (tempR < BOARD_SIZE && secretBoard[tempR][c] === 'ship') {
            vShip.push([tempR, c]);
            tempR++;
          }

          // Elegir el segmento válido que pertenezca al barco
          const chosen = hShip.length >= vShip.length ? hShip : vShip;
          if (chosen.length > 0) {
            chosen.forEach(([sr, sc]) => {
              visited[sr][sc] = true;
            });
            ships.push(chosen);
          }
        }
      }
    }
    return ships;
  };

  // ==========================================
  // FUNCIÓN DE VICTORIA: Cuenta cuántos barcos están 100% hundidos
  // ==========================================
  const checkWinCondition = (secretBoard: Board, attackBoard: Board): boolean => {
    const ships = getShipsFromBoard(secretBoard);
    let sunkenCount = 0;

    // Recorremos cada barco único que colocó el jugador
    for (const ship of ships) {
      // Verificamos si TODAS las coordenadas de este barco específico recibieron un 'hit'
      const isFullySunk = ship.every(([r, c]) => attackBoard[r][c] === 'hit');
      if (isFullySunk) {
        sunkenCount++;
      }
    }

    // EJEMPLO DE PRUEBA: Si quieres que gane al hundir 1 barco (se puede cambiar a >=2 para que sean 2 barcos) (puedes cambiarlo a ships.length para que gane al hundir todos)
    return sunkenCount >= 1; 
  };

  // ==========================================
  // 5. RENDERIZADO PRINCIPAL (UI)
  // ==========================================
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Barra de notificaciones superior */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '15px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        Batalla Naval | {message}
      </div>

      {/* Contenedor dividido en dos mitades (Jugador 1 y Jugador 2) */}
      <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 60px)', position: 'relative' }}>
        
        {/* Pantalla ciega (Blindfold) para pasar la PC de forma segura al Jugador 2 */}
        {phase === 'blindfold1' && (
          <div style={{ position: 'absolute', width: '100%', height: '100%', background: '#1e293b', color: '#fff', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2>🔒 Turno del Jugador 1 Finalizado</h2>
            <p>Cede la computadora al <strong>Jugador 2</strong> de forma secreta.</p>
            <button 
              onClick={() => setPhase('setupP2')}
              style={{ padding: '12px 24px', fontSize: '16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Soy el Jugador 2, estoy listo
            </button>
          </div>
        )}

        {/* Lado Izquierdo */}
        <JugadorUno 
          phase={phase}
          turn={turn}
          board1={board1}
          attacks1={attacks1}
          attacks2={attacks2} // Pasamos los ataques del rival para la revelación final
          orientation={orientation}
          setOrientation={setOrientation}
          onPlaceShip={(r, c) => handlePlaceShip(1, r, c)}
          onResetSetup={() => handleResetSetup(1)}
          onConfirmSetup={() => handleConfirmSetup(1)}
          onAttack={handleAttack}
          shipIndex1={shipIndex1}
        />

        {/* Lado Derecho */}
        <JugadorDos 
          phase={phase}
          turn={turn}
          board2={board2}
          attacks2={attacks2}
          attacks1={attacks1} // Pasamos los ataques del rival para la revelación final
          orientation={orientation}
          setOrientation={setOrientation}
          onPlaceShip={(r, c) => handlePlaceShip(2, r, c)}
          onResetSetup={() => handleResetSetup(2)}
          onConfirmSetup={() => handleConfirmSetup(2)}
          onAttack={handleAttack}
          shipIndex2={shipIndex2}
        />

        {/* Pantalla final de Game Over */}
        {phase === 'gameover' && (
          <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#22c55e', marginBottom: '10px' }}>¡Jugador {winner} Gana! 🏆</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Los tableros han sido revelados.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '12px 24px', fontSize: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Jugar de Nuevo
            </button>
          </div>
        )}

      </div>
    </div>
  );
}