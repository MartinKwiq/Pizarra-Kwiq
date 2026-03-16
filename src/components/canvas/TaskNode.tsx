import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Calendar, User, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const TaskNode = ({ data }: { data: any }) => {
  const { task } = data;
  const statusColor = task.status?.color || '#7b68ee';

  return (
    <div className="bg-clickup-gray/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl w-64 group hover:border-clickup-purple/50 transition-all border-l-4" style={{ borderLeftColor: statusColor }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight text-white/90 group-hover:text-white transition-colors line-clamp-2">
            {task.name}
          </h3>
          <div 
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0" 
            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
          >
            {task.status?.status}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-[11px] text-gray-400">
          {task.due_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>{new Date(parseInt(task.due_date)).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[100px]">
                {task.assignees?.[0]?.username || 'Sin asignar'}
              </span>
            </div>
            {task.priority && (
               <div className="flex items-center gap-1">
                 <Tag className="w-3 h-3" />
                 <span className="font-bold" style={{ color: task.priority.color }}>{task.priority.priority}</span>
               </div>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(TaskNode);
