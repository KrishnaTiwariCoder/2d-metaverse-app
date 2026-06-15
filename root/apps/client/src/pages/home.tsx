import React, {  useState } from 'react';
import styles from '../styles';
import CreateMap from '../components/createmap';
import { Space } from '../redux/spaceSlice';
import {Link} from "react-router-dom";
import { useSelector } from 'react-redux';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {spaces} = useSelector((state:any)=>state.spaces) || [];
  const { currentUser :{ username} } = useSelector((state:any)=>state.auth);  

  const [spaceForm, setSpaceForm] = useState({
    name: '',
    dimensions: { width: '', height: '' },
    mapId: null
  });
  const [showMapSelector, setShowMapSelector] = useState(false);
  
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  const filteredSpaces = spaces.filter((space:Space) =>{
   return space.name.toLowerCase().includes(searchQuery.toLowerCase())
  }
  );
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>👋</span>
          <span style={styles.brandName}>Metaverse</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.username}>{username}</span>
          <div style={styles.avatar}>
            {getInitials(username)}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <div style={styles.tabSection}>
            <button style={styles.activeTab}>All active spaces</button>
          </div>
          <div style={styles.searchSection}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button 
              style={styles.createButton}
              onClick={() => setShowCreateModal(true)}
            >
              <span style={styles.buttonIcon}>➕</span>
              Create a space
            </button>
          </div>
        </div>

        <div style={styles.spacesGrid}>
          {filteredSpaces.map((space:Space) => (
            <Link  key={space.id} to={`/spaces/${space.id}`}>
            <div style={styles.spaceCard}>
              <h3 style={styles.spaceTitle}>{space.name}</h3>
              <div style={styles.spaceFooter}>
                <div style={styles.memberCount}>
                  <span style={styles.memberIcon}>{space.creator.username}</span>
                  <span>{space.dimensions.x}x{space.dimensions.y}</span>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Create Space Modal */}
      {showCreateModal && (
        <CreateMap 
          setShowCreateModal={setShowCreateModal}
          spaceForm={spaceForm}
          setSpaceForm={setSpaceForm}
          showMapSelector={showMapSelector}
          setShowMapSelector={setShowMapSelector}
        />
      )}
    </div>
  );
}

