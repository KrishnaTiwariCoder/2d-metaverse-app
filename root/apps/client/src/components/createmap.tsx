import React from 'react'
import styles from '../styles';
import { createSpace } from '../utils/spaces';
import { useSelector , useDispatch } from 'react-redux';
import { addNewSpace } from '../redux/spaceSlice';

const CreateMap = ({ setShowCreateModal, spaceForm, setSpaceForm, showMapSelector, setShowMapSelector }: any) => {
  const user = useSelector((state: any) => state.auth.currentUser);
  const maps = useSelector((state:any) => state.spaces.maps);
  const dispatch = useDispatch();
  const handleSelectMap = (map: any) => {
    setSpaceForm({
      ...spaceForm,
      mapId: map._id,
      dimensions: { width: map.width, height: map.height }
    });
    setShowMapSelector(false);
  };

  const handleSelectNone = () => {
    setSpaceForm({
      ...spaceForm,
      mapId: null
    });
    setShowMapSelector(false);
  };

  const handleCreateSpace = async () => {
    const data = {
        name: spaceForm.name,
        dimensions: `${spaceForm.dimensions.width}x${spaceForm.dimensions.height}`,
        mapId: spaceForm.mapId || ""
    }
    console.log('Creating space:', data);
    const res = await createSpace(data);
    if(res){
        setShowCreateModal(false);
        setSpaceForm({ name: '', dimensions: { width: '', height: '' }, mapId: null });
        const newSpace = {
            id: res.spaceId,
            name: spaceForm.name,
            dimensions :{x:spaceForm.dimensions.width , y:spaceForm.dimensions.height},
            thumbnail: selectedMap?.thumbnail,
            creator:{username : user.username , _id:user.id },
        }
        dispatch(addNewSpace(newSpace))
    }else{
        alert('Failed to create space');
    }

  };

  const selectedMap = maps.find((m: any) => m.id === spaceForm.mapId);
  return (
    <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              style={styles.closeButton}
              onClick={() => setShowCreateModal(false)}
            >
              ✕
            </button>
            
            <h2 style={styles.modalTitle}>Create a New Space</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Space Name</label>
              <input
                type="text"
                placeholder="Enter space name"
                value={spaceForm.name}
                onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dimensions</label>
              <div style={styles.dimensionsRow}>
                <input
                  type="number"
                  placeholder="Width"
                  value={spaceForm.dimensions.width}
                  onChange={(e) => setSpaceForm({ 
                    ...spaceForm, 
                    dimensions: { ...spaceForm.dimensions, width: e.target.value }
                  })}
                  style={styles.dimensionInput}
                  disabled={spaceForm.mapId !== null}
                />
                <span style={styles.dimensionSeparator}>×</span>
                <input
                  type="number"
                  placeholder="Height"
                  value={spaceForm.dimensions.height}
                  onChange={(e) => setSpaceForm({ 
                    ...spaceForm, 
                    dimensions: { ...spaceForm.dimensions, height: e.target.value }
                  })}
                  style={styles.dimensionInput}
                  disabled={spaceForm.mapId !== null}
                />
              </div>
              {spaceForm.mapId && (
                <p style={styles.dimensionNote}>
                  Dimensions are set by the selected map
                </p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Map Selection</label>
              {selectedMap ? (
                <div style={styles.selectedMapCard}>
                  <img 
                    src={selectedMap.thumbnail} 
                    alt={selectedMap.name}
                    style={styles.selectedMapThumbnail}
                  />
                  <div style={styles.selectedMapInfo}>
                    <h4 style={styles.selectedMapName}>{selectedMap.name}</h4>
                    <p style={styles.selectedMapDimensions}>
                      {selectedMap.dimensions.width} × {selectedMap.dimensions.height}
                    </p>
                  </div>
                  <button 
                    style={styles.changeMapButton}
                    onClick={() => setShowMapSelector(true)}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button 
                  style={styles.selectMapButton}
                  onClick={() => setShowMapSelector(true)}
                >
                  {showMapSelector ? 'Close Map Selection' : 'Select Map or None'}
                </button>
              )}
            </div>

            {showMapSelector && (
              <div style={styles.mapSelector}>
                <h3 style={styles.mapSelectorTitle}>Choose a Map</h3>
                
                <button 
                  style={styles.noneMapCard}
                  onClick={handleSelectNone}
                >
                  <div style={styles.noneMapIcon}>🚫</div>
                  <div style={styles.noneMapText}>
                    <h4 style={styles.mapName}>None</h4>
                    <p style={styles.mapDimensions}>Custom dimensions</p>
                  </div>
                </button>

                <div style={styles.mapGrid}>
                  {maps.map((map: any) => (
                    <button
                      key={map._id}
                      style={styles.mapCard}
                      onClick={() => handleSelectMap(map)}
                    >
                      <img 
                        src={map.thumbnail} 
                        alt={map.name}
                        style={styles.mapThumbnail}
                      />
                      <div style={styles.mapInfo}>
                        <h4 style={styles.mapName}>{map.name}</h4>
                        <p style={styles.mapDimensions}>
                          {map.width} × {map.height }
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              style={{
                ...styles.createSpaceButton,
                opacity: !spaceForm.name || (!spaceForm.dimensions.width && !spaceForm.mapId) ? 0.5 : 1,
                cursor: !spaceForm.name || (!spaceForm.dimensions.width && !spaceForm.mapId) ? 'not-allowed' : 'pointer'
              }}
              onClick={handleCreateSpace}
              disabled={!spaceForm.name || (!spaceForm.dimensions.width && !spaceForm.mapId)}
            >
              🎉 Create Space
            </button>
          </div>
        </div>
  )
  
}

export default CreateMap;