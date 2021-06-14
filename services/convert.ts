export function getDateString(num:number):string {
    var dateArr:string[] = (new Date(num)).toUTCString().split(" ");
    return dateArr[2]+" "+dateArr[1]+" "+dateArr[3];
}