import React, { useState } from 'react';
import {   useSelector } from 'react-redux';
import { Element } from '../../redux/elementSlice';
// import { addGameElement } from '../../redux/gameslice';
// import { addElementToSpace } from '../../utils/spaces';


export default function ElementBox({ wsRef }: { wsRef: React.RefObject<WebSocket> }) {
  const { width, height } = useSelector((state: any) => state.game.spaceDimensions);
  const elements = useSelector((state: any) => state.elements.elements);
  // const spaceId = useSelector((state: any) => state.game.spaceId);
  // const dispatch = useDispatch();

  const [selectedItem, setSelectedItem] = useState<Element | null>(null);
  const [coordX, setCoordX] = useState<string>('');
  const [coordY, setCoordY] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSelectItem = (item: Element) => {
    setSelectedItem(item);

    setCoordX('');
    setCoordY('');
    setErrorMsg('');
  };

  const onAddElement = (element: { itemId: string; x: number; y: number }) => {
    wsRef.current?.send(JSON.stringify({
      type: 'element-added',
      payload: {
        elementId: element.itemId,
        x: element.x,
        y: element.y
      }
    }));
    
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const xVal = Number(coordX);
    const yVal = Number(coordY);

    // Validate absolute bounding constraints
    if (isNaN(xVal) || xVal < 0 || xVal > width) {
      setErrorMsg(`X coordinate must be between 0 and ${width}`);
      return;
    }
    if (isNaN(yVal) || yVal < 0 || yVal > height) {
      setErrorMsg(`Y coordinate must be between 0 and ${height}`);
      return;
    }

    // Call upstream trigger
    onAddElement({
      itemId: selectedItem._id,
      x: xVal,
      y: yVal
    });

    // Clear state after creation
    setSelectedItem(null);
    setCoordX('');
    setCoordY('');
    setErrorMsg('');
  };

  return (
    <div className="w-80 h-full bg-[#0a1120] border-l border-slate-800 flex flex-col font-sans select-none text-slate-200">
      
      {/* Container Header */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
          Add Elements
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Space Max Size: {width}px × {height}px
        </p>
      </div>

      {/* Main Scrollable Directory List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {elements.map((item:Element) => {
          const isCurrentSelection = selectedItem && selectedItem._id === item._id;
          return (
            <button
              key={item._id}
              onClick={() => handleSelectItem(item)}
              className={`w-full flex items-center p-3 rounded-xl transition-all border text-left ${
                isCurrentSelection
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
              }`}
            >
              {/* <span className="text-2xl mr-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                {item.imageUrl}
              </span> */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-8 h-8 mr-3 bg-slate-900 p-1 rounded-lg border border-slate-800 object-contain"
                />
              <div className="truncate">
                <p className="font-medium text-sm text-slate-200">{item.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Placement Prompt Area (Sticks to the Bottom) */}
      {selectedItem && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 shadow-2xl animate-fade-in-up">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm">Placing:</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-6 h-6 mr-2 inline-block"
                />
              )}
              {selectedItem.name}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">X Coordinate</label>
                <input
                  type="number"
                  min="0"
                  max={width}
                  value={coordX}
                  onChange={(e) => setCoordX(e.target.value)}
                  placeholder={`0 - ${width}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Y Coordinate</label>
                <input
                  type="number"
                  min="0"
                  max={height}
                  value={coordY}
                  onChange={(e) => setCoordY(e.target.value)}
                  placeholder={`0 - ${height}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
            )}

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-1/3 text-xs bg-transparent hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg py-2 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2 transition-colors shadow-lg shadow-blue-900/20"
              >
                Confirm Placement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}