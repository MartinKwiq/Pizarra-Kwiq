'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  useNodesState, 
  useEdgesState,
  Node,
  XYPosition
} from 'reactflow';
import 'reactflow/dist/style.css';
import TaskNode from './TaskNode';

const nodeTypes = {
  task: TaskNode,
};

interface InfiniteCanvasProps {
  initialTasks: any[];
  savedPositions: { task_id: string; x: number; y: number }[];
}

export default function InfiniteCanvas({ initialTasks, savedPositions }: InfiniteCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const positionMap = new Map(savedPositions.map(p => [p.task_id, { x: p.x, y: p.y }]));
    
    const initialNodes: Node[] = initialTasks.map((task, index) => {
      const savedPos = positionMap.get(task.id);
      return {
        id: task.id,
        type: 'task',
        position: savedPos || { x: index * 300, y: 100 },
        data: { task },
        dragHandle: '.bg-clickup-gray', // Solo arrastrar por el fondo
      };
    });

    setNodes(initialNodes);
  }, [initialTasks, savedPositions, setNodes]);

  const onNodeDragStop = useCallback(async (_event: any, node: Node) => {
    try {
      await fetch('/api/clickup/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: node.id,
          x: node.position.x,
          y: node.position.y
        })
      });
    } catch (error) {
      console.error('Failed to save node position:', error);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-clickup-dark relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#2a2a2a" gap={20} />
        <Controls className="!bg-clickup-gray !border-white/10 !fill-white" />
        <Panel position="top-right" className="bg-clickup-gray/80 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">Sincronizado con ClickUp</span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
