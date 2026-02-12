import { hello } from "@rippledoc/core/index";

const msg = document.getElementById("msg");
msg!.innerText = hello();
