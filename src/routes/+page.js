import Papa from 'papaparse';
import { base } from '$app/paths';

export async function load({ fetch, params }) {

  const responseCSV = await fetch(base + '/data_with_color.csv', {headers: {'Content-Type': 'text/csv'}})
  let textCSV = await responseCSV.text()
  let parsedCSV = Papa.parse(textCSV, {header: true})

  return {
    books: parsedCSV.data 
  }
}

export const ssr = false;
export const csr = true;