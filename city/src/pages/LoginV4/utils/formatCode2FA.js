/** 
 * @author eloifabrega@ionsmart.eu
 * 
 * 
 * EXAMPLE:


const [inpCode,setInpCode] = useState("")


function handleChangeInput(e){
  const inputValue = e.target.value.trim();
  const key = e.nativeEvent.data // key pressed, if its nota a single char -> null
  setInpCode(prev=>formatCode2FA(inputValue,key,prev))
}

<input type="text" value={inpCode} onChange={handleChangeInput} />

*/




//formatea automaticamente el codigo para que el usuario no necesite introducir los guiones
export function formatCode2FA(input,key,prev) {
  const SPACER = "-";
  const CHARACTER_LENGTH = 6// 11-22-33 length==6;
  const GROUPBY = 2;
  const TOTAL_LENGTH = CHARACTER_LENGTH + Math.floor(CHARACTER_LENGTH/GROUPBY - 1) * SPACER.length;
  const isSpacerRequired = (str) => (str.length + SPACER.length) % (GROUPBY + SPACER.length) === 0  && (str.length + SPACER.length)<TOTAL_LENGTH;
  //user types spacer
  if(key===SPACER){
    //add spacer if is in right place, otherwise dont add spacer
    return isSpacerRequired(prev) ? input : prev
  } 
  //get only the numbers
  //separate numbers in groups
  //join the numbers with spacers
  const filteredInput = input.replace(/[^0-9]/g, ""); // Remove non-numeric characters
  const groups = [];
  for (let i = 0; i < filteredInput.length; i += GROUPBY) {
    groups.push(filteredInput.slice(i, i + GROUPBY));
  }
  const formattedString = groups.join(SPACER);
  //add automaticaly spacer
  if(key!==null //user is not deleting
    && !isNaN(key) //typed a number
    && isSpacerRequired(formattedString) //spacer is in right place
  ){
    return formattedString + SPACER
  }
  return formattedString.slice(0, TOTAL_LENGTH);
}