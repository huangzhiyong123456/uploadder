interface HandlerInfo {
    handler: any;
    once?: boolean;
  }
  
class customEvent {
    private handlers: Map<string, HandlerInfo[]> = new Map();
  
    on(eName: string, handler: any, once?: boolean) {
        if (!this.handlers.has(eName)) {
            this.handlers.set(eName, []);
        }
        (this.handlers.get(eName) || []).push({
            handler,
            once
        });
        return () => {
            this.off(eName, handler);
        };
    }
  
    once(eName: string, handler: any) {
        return this.on(eName, handler, true);
    }
  
    off(eName?: string, handler?: any): void {
        if (!eName) return;
        if (!handler) {
            this.handlers.set(eName, []);
        }
        this.handlers.set(
            eName,
            (this.handlers.get(eName) || []).filter(item => item.handler !== handler)
        );
    }
  
    dispatchEvent(eName: string, ...args: any[]) {
        let i = 0;
        while (i < (this.handlers.get(eName) || []).length) {
            const handlers: HandlerInfo[] = this.handlers.get(eName) || [];
            const { handler, once } = handlers[i];
            if (once) {
                handlers.splice(i--, 1);
            }
            i++;
            handler(...args);
        }
    }
}
  
export default customEvent;
  