import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { removeSpace, Space } from '../../redux/spaceSlice';
import { deleteSpace } from '../../utils/spaces';
import { useDispatch, useSelector } from 'react-redux';

export default function SpaceCard({ space } : {space: Space}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const myId = useSelector((state:any)=>state.auth.myId);

  const onDelete = async ()=>{
    const res = await deleteSpace(space.id);
    if(res.status==200){
        dispatch(removeSpace(space.id));
    } else {
      alert(res.error || "Failed to delete space");
    }
  }

  useEffect(() => {
    function handleClickOutside(event:MouseEvent) {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group w-80 p-5 rounded-2xl bg-[#212121] text-[#e3e3e3] font-sans shadow-lg select-none">
      
      {/* Header Row with Title and Three Dots */}
      <div className="flex justify-between items-start">
        <Link to={`/spaces/${space.id}`} className="flex-1">
          <h3 className="text-xl font-bold tracking-wide truncate pr-6">{space.name}</h3>
        </Link>
        
        {
              space.creator._id === myId && (<div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 py-1 origin-top-right">
              <button
                onClick={() => { onDelete(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>)
        }
        
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-400 font-medium">
        <div className="flex items-center space-x-3">
          <span className="truncate max-w-[140px]">{space.creator.username}</span>
          <span>{space.dimensions.x}x{space.dimensions.y}</span>
        </div>
      </div>

    </div>
  );
}