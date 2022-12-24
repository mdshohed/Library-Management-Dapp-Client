import { useState, useEffect } from "react";
import { ContractAddress } from "../config";
import {ethers} from "ethers";

import Library from '../abi/Library.json';
import { NextPage } from 'next'; 
import { EtherscanProvider } from "@ethersproject/providers";

declare let window: any;
import './components/Book';
import Book from "./components/Book";

const Home:NextPage =()=>{

  const [currentAccount, setCurrentAccount] = useState(''); 
  const [bookName, setBookName] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookYear, setBookYear] = useState('');
  const [bookFinished, setBookFinished] = useState('no');
  const [booksFinished, setBooksFinished] = useState([]);
  const [booksUnFinished, setBooksUnFinished] = useState([]);

  const connectWallet =async () => {
    try{
      const {ethereum} = window;
      console.log(ethereum); 
      if(!ethereum){
        console.log("Metamask no detected"); 
        return; 
      }
      let chainId = await ethereum.request({method:'eth_chainId'});
      const goerliChainId = '0x5';  
      if(chainId !== goerliChainId) {
        alert("You are not connected to Goerli network"); 
        return;
      }
      const accounts = await ethereum.request({method:'eth_requestAccounts'});
      console.log(accounts);  
      setCurrentAccount(accounts[0]); 

    }catch(error){
      console.log("Error connecting to Metamask:", error);
    }
  }

  const submitBook =async () => {
    let book = {
      'name': bookName, 
      'year': bookYear, 
      'author': bookAuthor,
      'finished': bookFinished =='yes' ? true : false,
    };
    try {
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const libraryContract = new ethers.Contract(ContractAddress, Library.abi, signer);

        let libraryTx = await libraryContract.addBook(book.name, book.year, book.author, book.finished);
        console.log(libraryTx);
      }else{
        console.log("Ethereum object does not exit");
      }
    } catch (error) {
      console.log("Error submitting new Book.", error);
    }
  }

  const getBooks = async()=>{
    try {
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const libraryContract = new ethers.Contract(ContractAddress, Library.abi, signer);

        let booksFinished = await libraryContract.getFinishedBooks();
        let booksUnfinished = await libraryContract.getUnFinishedBooks();

        setBooksFinished(booksFinished);
        setBooksUnFinished(booksUnfinished);

      }else{
        console.log("Ethereum object does not exit");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const clickBookFinished = async (id)=>{
    try {
      const {ethereum} = window;
      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const libraryContract = new ethers.Contract(ContractAddress, Library.abi, signer);

        let libraryTx = await libraryContract.setFinished(id, true);
        console.log(libraryTx);
      }else{
        console.log("Ethereum object does not exit");
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  return (<>
    <div className="flex flex-col items-center bg-[#f3f6f4] text-[#6a50aa] min-h-screen pb-20">
      <div className="transition hover:rotate-100 hover:scale-105 transition duration-500 ease-in-out">
      </div>
      <h2 className="text-3xl font-bold mb-20 mt-12">Manage your Personal Library</h2>
      {
        currentAccount === ''? (
          <button className="text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition" onClick={connectWallet}>Connect Wallet</button>
        ):(
          <div className="">
            <div className="text-3xl font-bold mb-20 mt-12">
              <h4>Wallet Connected: {currentAccount}</h4>
            </div>

            <div className="text-xl font-semibold mb-20 mt-4">
              <input className="text-xl font-bold mb-2 mt-1" type="text" placeholder="Book Name" value={bookName} onChange={(e)=>setBookName(e.target.value)} />
              <br />
              <input className="text-xl font-bold mb-2 mt-1" type="text" placeholder="Book Author" value={bookAuthor} onChange={(e)=>setBookAuthor(e.target.value)} />
              <br />
              <input className="text-xl font-bold mb-2 mt-1" type="text" placeholder="Book Year" value={bookYear} onChange={(e)=>setBookYear(e.target.value)} />
              <br />
              <label>
                have you finished reading this Book? 
                <select value={bookFinished} onChange={(e)=>setBookFinished(e.target.value)}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <button className="text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition" onClick={submitBook}>Add Book</button>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="font-semibold text-lg text-center mb-4">Books List</div>
              <button className="text-xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out" onClick={getBooks}>Get Books</button>
              {
                booksUnFinished.length > 0 ? <div className="font-semibold text-lg text-center mb-4 mt-5">
                  Books Unfinished ({booksUnFinished.length})
                </div> : <div className=""></div>
              }
              <div className="flex flex-row justify-center items-center">
                {
                  booksUnFinished.map((book)=>(
                    <Book
                    key={book.id}
                    id={parseInt(book.id)}
                    name={book.name}
                    year={parseInt(book.year).toString()}
                    author={book.author}
                    finished={book.finished.toString()}
                    clickBookFinished = {clickBookFinished}
                    />
                  ))}
              </div>
              {
                booksFinished.length > 0 ? <div className="font-semibold text-lg text-center mb-4 mt-5">
                  Books finished ({booksFinished.length})
                </div> : <div className=""></div>
              }
                <div className="flex flex-row justify-center items-center">
                {
                  booksFinished.map((book)=>(
                    <Book
                    key={book.id}
                    id={parseInt(book.id)}
                    name={book.name}
                    year={parseInt(book.year).toString()}
                    author={book.author}
                    finished={book.finished.toString()}
                    clickBookFinished = {clickBookFinished}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        )
      }
    </div>
  </>)
}

export default Home;