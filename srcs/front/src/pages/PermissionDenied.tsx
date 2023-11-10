function NoPermissionPage() {
    
  const MsgStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12%',
    left: '48%',
    fontSize: '28px',
    fontFamily: "'Press Start 2P'",
    color: 'grey',
    transform: 'translateX(-50%)',
    width: '50%'
}
    return (
      <div>
        <h1 style={MsgStyle}>No tienes permiso para acceder a esta página.</h1>
      </div>
    );
  }
  
  export default NoPermissionPage;
  