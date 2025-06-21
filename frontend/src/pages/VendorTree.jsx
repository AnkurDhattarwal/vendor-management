// frontend/src/pages/VendorTree.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Paper,
  CircularProgress,
  Box
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  AccountCircle
} from '@mui/icons-material';
import api from '../services/api';

export default function VendorTree() {
  // Store children arrays by parentId key ('root' for top level)
  const [nodesByParent, setNodesByParent] = useState({});
  const [loading, setLoading] = useState({});   // loading state per key
  const [expanded, setExpanded] = useState([]); // list of expanded nodeIds

  // Fetch children for a given parent
  const fetchChildren = useCallback(async parentId => {
    const key = parentId || 'root';
    if (nodesByParent[key]) return; // already loaded
    setLoading(l => ({ ...l, [key]: true }));
    try {
      const url = parentId
        ? `/users?parentId=${parentId}`
        : '/users';
      const res = await api.get(url);
      setNodesByParent(m => ({ ...m, [key]: res.data.data }));
    } finally {
      setLoading(l => ({ ...l, [key]: false }));
    }
  }, [nodesByParent]);

  // Load root on mount
  useEffect(() => {
    fetchChildren(null);
  }, [fetchChildren]);

  // Toggle expand/collapse
  const handleToggle = nodeId => {
    setExpanded(exp =>
      exp.includes(nodeId)
        ? exp.filter(id => id !== nodeId)
        : [...exp, nodeId]
    );
    if (!expanded.includes(nodeId)) {
      fetchChildren(nodeId);
    }
  };

  // Recursive renderer
  const renderNodes = (parentId = null, level = 0) => {
    const key = parentId || 'root';
    const children = nodesByParent[key];
    if (!children) {
      if (loading[key]) {
        return (
          <Box pl={level * 2} key={key + '-loading'}>
            <CircularProgress size={16} />
          </Box>
        );
      }
      return null;
    }

    return (
      <List disablePadding>
        {children.map(node => {
          const isExpanded = expanded.includes(node._id);
          const hasChildren = node.role !== 'driver'; // drivers have no further children
          return (
            <Box key={node._id}>
              <ListItemButton
                onClick={() => hasChildren && handleToggle(node._id)}
                sx={{
                  pl: 2 + level * 2,
                  bgcolor: level % 2 ? 'grey.50' : 'common.white',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AccountCircle color={hasChildren ? 'primary' : 'disabled'} />
                </ListItemIcon>
                <ListItemText
                  primary={node.email}
                  secondary={node.role || 'pending'}
                />
                {hasChildren &&
                  (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  {renderNodes(node._id, level + 1)}
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{fontWeight:'bold',fontStyle:'italic',color:'#43B02A'}}>
            Vendor Hierarchy
          </Typography>
          
        </Box>
        {renderNodes()}
      </Paper>
    </Container>
  );
}
