"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Deployment } from "@/lib/api";

export function useRealtimeTasks(initialTasks: Deployment[]) {
  const [tasks, setTasks] = useState<Deployment[]>(initialTasks);
  const supabase = createClient();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    // Subscribe to 'tasks'.
    const channel = supabase
      .channel("public:tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          console.log("Realtime change received:", payload);
          
          if (payload.eventType === "INSERT") {
            const newTask = payload.new as any;
            
            // Schema recovery.
            let p: any = {};
            try {
              p = typeof newTask.payload === 'string' ? JSON.parse(newTask.payload) : newTask.payload;
            } catch (e) { console.error("Failed to parse task payload", e); }

            setTasks((prev) => [
              {
                job_id: newTask.id,
                job_type: newTask.job_type || p.job_type || "SERVICE",
                status: mapStatus(newTask.status || p.status || "pending"),
                required_cpu: newTask.required_cpu || p.required_cpu || 0,
                required_ram: newTask.required_ram || p.required_ram || 0,
                assigned_worker_id: newTask.assigned_worker_id || p.assigned_worker_id || "",
                created_at: newTask.created_at,
              },
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updatedTask = payload.new as any;
            setTasks((prev) =>
              prev.map((t) =>
                t.job_id === updatedTask.id
                  ? {
                      ...t,
                      status: mapStatus(updatedTask.status),
                      assigned_worker_id: updatedTask.assigned_worker_id || t.assigned_worker_id,
                      public_route: updatedTask.public_route || t.public_route,
                    }
                  : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.job_id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return tasks;
}

// Status mapper.
function mapStatus(status: string): number {
  switch (status) {
    case "provisioning": return 0;
    case "running": return 1;
    case "completed": return 2;
    case "failed": return 3;
    default: return 0;
  }
}
