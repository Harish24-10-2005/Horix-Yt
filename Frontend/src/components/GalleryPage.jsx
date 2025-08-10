import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlay, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Wrap = styled.div`display:flex;flex-direction:column;gap:2rem;`;
const Header = styled.div`display:flex;align-items:center;gap:1rem;justify-content:space-between;`;
const Title = styled.h2`margin:0;font-size:clamp(1.6rem,2.2vw,2.4rem);background:${p=>p.theme.colors.gradientPrimary};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.4rem;`;
const Card = styled(motion.div)`position:relative;border:1px solid ${p=>p.theme.colors.border};background:${p=>p.theme.colors.surface2};border-radius:${p=>p.theme.radii? p.theme.radii.md:'16px'};overflow:hidden;display:flex;flex-direction:column;`;
const Thumb = styled.div`position:relative;padding-top:56%;background:#12121a;overflow:hidden;img,video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}`;
const Body = styled.div`padding:.85rem .95rem 1rem;display:flex;flex-direction:column;gap:.6rem;flex:1;`;
const TitleLine = styled.div`font-size:.8rem;letter-spacing:.06em;font-weight:600;color:${p=>p.theme.colors.text};line-height:1.3;min-height:2.1em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;`;
const Meta = styled.div`display:flex;justify-content:space-between;font-size:.6rem;letter-spacing:.12em;color:${p=>p.theme.colors.textSecondary};text-transform:uppercase;`;
const Actions = styled.div`display:flex;gap:.5rem;margin-top:auto;`;
const Btn = styled.button`flex:1;background:${p=>p.variant==='danger'? p.theme.colors.errorTransparent: p.theme.colors.primaryTransparent};border:1px solid ${p=>p.variant==='danger'? p.theme.colors.error: p.theme.colors.primary};color:${p=>p.variant==='danger'? p.theme.colors.error: p.theme.colors.primary};padding:.55rem .6rem;font-size:.65rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:.35rem;transition:.3s; &:hover{background:${p=>p.variant==='danger'? p.theme.colors.error: p.theme.colors.primary};color:#fff;}`;
const Empty = styled.div`padding:3rem 1rem;text-align:center;font-size:.85rem;opacity:.65;`;

export function GalleryPage(){
  const { gallery, fetchGallery, deleteAsset, loading } = useAuth();
  useEffect(()=>{ fetchGallery().catch(()=>{}); },[fetchGallery]);
  return <Wrap>
    <Header>
      <Title>Your Video Gallery</Title>
      <small style={{opacity:.6,fontSize:'.65rem',letterSpacing:'.12em'}}>{gallery.length} item{gallery.length!==1 && 's'}</small>
    </Header>
    {gallery.length===0 && !loading && <Empty>No videos saved yet. Generate a video then save it to see it here.</Empty>}
    <Grid>
      {gallery.map(v=> (
        <Card key={v.id} whileHover={{y:-6,boxShadow:'0 18px 38px -14px rgba(0,0,0,.55)'}} transition={{type:'spring',stiffness:260,damping:22}}>
          <Thumb>{v.thumbnail? <img src={v.thumbnail} alt={v.title}/> : <video src={v.path} muted playsInline/>}</Thumb>
          <Body>
            <TitleLine title={v.title}>{v.title}</TitleLine>
            <Meta>
              <span>{v.duration_sec? Math.round(v.duration_sec)+'s':'--'}</span>
              <span>{new Date(v.created_at).toLocaleDateString()}</span>
            </Meta>
            <Actions>
              <Btn as="a" href={v.path} target="_blank" rel="noopener" title="Play"><FiPlay size={14}/> Play</Btn>
              <Btn variant="danger" type="button" onClick={()=>deleteAsset(v.id)} title="Delete"><FiTrash2 size={14}/> Del</Btn>
            </Actions>
          </Body>
        </Card>
      ))}
    </Grid>
  </Wrap>;
}

export default GalleryPage;
