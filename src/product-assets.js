const svg = body => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760">' + body + '</svg>')

export const productAssets = {
  dress: svg('<path fill="#111" d="M238 76h124l20 130 94 486H124l94-486z"/><path fill="#fff" d="M270 94h60v88h-60z"/><path fill="none" stroke="#fff" stroke-width="9" d="M239 210h122M187 626h226"/>'),
  trouser: svg('<path fill="#111" d="M190 84h220l-18 220 34 386H264l-16-300-18 300H174l34-386z"/><path fill="#fff" d="M238 84h124v58H238z"/><path fill="none" stroke="#fff" stroke-width="8" d="M300 142v244"/>'),
  shirt: svg('<path fill="#f2f2ed" stroke="#111" stroke-width="9" d="M180 120l86-46h68l86 46 74 86-70 70-42-46v370H218V230l-42 46-70-70z"/><path fill="none" stroke="#111" stroke-width="8" d="M266 74l34 54 34-54M300 128v426"/>'),
  blazer: svg('<path fill="#111" d="M206 82l94-34 94 34 83 148-78 50-25-49v399H226V231l-25 49-78-50z"/><path fill="#f2f2ed" d="M300 49l55 58-55 112-55-112z"/><path fill="none" stroke="#f2f2ed" stroke-width="8" d="M300 219v337M266 310h68"/>'),
  skirt: svg('<path fill="#111" d="M228 70h144l18 160 84 412H126l84-412z"/><path fill="#f2f2ed" d="M228 70h144v56H228z"/><path fill="none" stroke="#f2f2ed" stroke-width="7" d="M216 256h168M190 390h220M160 520h280"/>'),
  tank: svg('<path fill="#111" d="M236 70h128l18 104 69 468H149l69-468z"/><path fill="#f2f2ed" d="M236 70h128v74H236z"/><path fill="none" stroke="#f2f2ed" stroke-width="8" d="M220 174h160"/>'),
  coat: svg('<path fill="#111" d="M205 62h190l75 127-55 46 35 407H150l35-407-55-46z"/><path fill="#f2f2ed" d="M300 62l67 100-67 91-67-91z"/><path fill="none" stroke="#f2f2ed" stroke-width="8" d="M300 253v389M238 355h124M238 465h124"/>'),
  pleat: svg('<path fill="#f2f2ed" stroke="#111" stroke-width="9" d="M236 65h128l20 138 78 439H138l78-439z"/><path fill="#111" d="M236 65h128v54H236z"/><path fill="none" stroke="#111" stroke-width="7" d="M232 260l-28 382M276 260l-10 382M324 260l10 382M368 260l28 382"/>')
}
