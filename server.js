import { serve } from "https://deno.land/std@0.138.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";

//let count = 0;
let previousWord = "しりとり";


console.log("Listening on http://localhost:8000");

//*serve(req => {
    //return new Response("Hello World");

    /*count++;
    return new Response(`Count: ${count}`);

    return new Response("<ht>見出しです</h1>", 
    {
        headers: { "Content-Type": "text/html; charset=utf-8"}
    });

});*/

serve(async (req) => {
    const pathname = new URL(req.url).pathname;
    console.log(pathname);
  
    if (req.method === "GET" && pathname === "/shiritori") {
      return new Response(previousWord);
    }
    if(req.method === "POST" && pathname === "/shiritori"){
        const requestJson = await req.json();
        const nextWord = requestJson.nextWord;
        if(
            nextWord.length > 0 &&
            previousWord.charAt(previousWord.length - 1) !== nextWord.charAt(0)
        ){
            return new Response("前の単語に続いていません．", { status: 400});
        }
        //ここから"ん"でおわるなを書いてみる
        if(nextWord.charAt(length-1) == "ん"){
            return new Response("「ん」でおわったので負け", { status: 400});
        }
        //ここまで
        previousWord = nextWord;
        return new Response(previousWord);
    }
  
    return serveDir(req, {
      fsRoot: "public",
      urlRoot: "",
      showDirListing: true,
      enableCors: true,
    });

    /*if (pathname === "/styles.css") {

        return new Response(await Deno.readTextFile("./public/styles.css"), {

        headers: { "Content-Type": "text/css; charset=utf-8" },

        });

    }
        return new Response(await Deno.readTextFile("./public/index.html"), {
    
        headers: { "Content-Type": "text/html; charset=utf-8" },
    
        });*/
  
  });