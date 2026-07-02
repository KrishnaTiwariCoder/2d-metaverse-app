import React, { useState } from 'react';
import {  useSelector } from 'react-redux';


export default function RemoveElementBox({ wsRef }: { wsRef: React.RefObject<WebSocket> }) {
  const { width, height } = useSelector((state: any) => state.game.spaceDimensions);
  const elements = useSelector((state: any) => state.game.elements);

  const [selectedItem, setSelectedItem] = useState<any>(null);


  const onRemoveElement = () => {
    console.log('Removing element with instanceId:', selectedItem.instanceId);
    wsRef.current?.send(JSON.stringify({
      type: 'element-removed',
      payload: {
        instanceId: selectedItem.instanceId,
      }
    }));
    
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;


    onRemoveElement();

    setSelectedItem(null);
  };

  return (
    <div className="w-80 h-full bg-[#0a1120] border-l border-slate-800 flex flex-col font-sans select-none text-slate-200">
      
      {/* Container Header */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
          Remove Elements
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Space Max Size: {width}px × {height}px
        </p>
      </div>

      {/* Main Scrollable Directory List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {elements.map((item:any) => {
          const isCurrentSelection = selectedItem && selectedItem.instanceId === item.instanceId;
          return (
            <button
              key={item.instanceId}
              onClick={() => setSelectedItem(item)}
              className={`w-full flex items-center p-3 rounded-xl transition-all border text-left ${
                isCurrentSelection
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
              }`}
            >
                <img
                  src={item.element.imageUrl}
                  alt={item.element.name}
                  className="w-8 h-8 mr-3 bg-slate-900 p-1 rounded-lg border border-slate-800 object-contain"
                />
                {item.x } : {item.y }  {item.instanceId}
              <div className="truncate">
                <p className="font-medium text-sm text-slate-200">{item.element.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Placement Prompt Area (Sticks to the Bottom) */}
      {selectedItem && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 shadow-2xl animate-fade-in-up">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm">Removing:</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
              {selectedItem.element.imageUrl && (
                <img
                  src={selectedItem.element.imageUrl}
                  alt={selectedItem.element.name}
                  className="w-6 h-6 mr-2 inline-block"
                />
              )}
              {selectedItem.element.name}
            </span>
          </div>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-1/3 text-xs bg-transparent hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg py-2 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                type="button"
                className="w-2/3 text-xs bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg py-2 transition-colors shadow-lg shadow-blue-900/20"
              >
                Confirm Removal
              </button>
            </div>
        </div>
      )}
    </div>
  );
}