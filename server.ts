import { serve } from "https://deno.land/std@0.138.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";
import { singleRoute } from "./route/single.ts"
import { waitingRoute } from "./route/wating.ts"
import { doubleRoute } from "./route/double.ts"


console.log("Listening on http://localhost:8000");


serve(async (req: Request) => {
   try {
       const pathname = new URL(req.url).pathname;
       console.log(pathname);

       if (pathname === '/shiritori') {
           return singleRoute(req);
       }

       if (pathname === '/api/waiting') {
           return waitingRoute(req);
       }

       if (pathname === '/api/double') {
           return doubleRoute(req)
       }
   } catch (e) {
       console.log(e)
   }

    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "",
      showDirListing: true,
      enableCors: true,
    });
  
  });

