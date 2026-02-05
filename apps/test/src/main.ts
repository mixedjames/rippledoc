import { hello } from "@core/index";

const msg = document.getElementById("msg");
msg!.innerText = hello();

