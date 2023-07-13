import { useAddress } from '@thirdweb-dev/react';
import React, { useState } from 'react'
import { createMeToken } from 'utils/fetchers/createMeToken';

export default function MeTokenCreationForm() {
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [hubId, setHubId] = useState(0);
    const [assetsDeposited, setAssetsDeposited] = useState("");
    const address = useAddress();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        console.log({ name, symbol, hubId, assetsDeposited });
        const data = await createMeToken({name, symbol, hubId, assetsDeposited}, address!);
        // do something with the form data
    };

    const inputBoxStyle = {
        borderRadius: '4px',
        display: 'flex',
        width: '300px',        
        marginBottom: '10px',
        padding: '15px',
        };


    return (
      <> 

        <form onSubmit={handleSubmit} 
            style={{ 
            backgroundColor: '#171923', 
            border: '2px solid #EDEDEE', 
            borderRadius: '15px', 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '1rem', 
            alignItems: 'center',
            marginBottom: '30px',
            }}>
        <h1 style={{ 
            marginBottom: '1em',
            fontSize: '2em',
            fontWeight: 'bold',
            }}
            >MeToken Creation Form</h1>
            <label>
                <strong>Name: </strong>
                <input
                    type="text"
                    placeholder='Your meToken Name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={ inputBoxStyle }
                />
            </label>
            <label>
                <strong>Symbol: </strong>
                <input
                    type="text"
                    placeholder='Your meToken symbol'
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    style={ inputBoxStyle }
                />
            </label>
            <label>
                <strong>Hub ID: </strong>
                <input
                    type="number"
                    placeholder='Your Hub ID number'
                    value={hubId}
                    onChange={e => setHubId(parseInt(e.target.value, 10))}
                    style={ inputBoxStyle }
                />
            </label>
            <label>
                <strong>Assets Deposited: </strong>
                <input
                    type="text"
                    placeholder='Number of assets deposited'
                    value={assetsDeposited}
                    onChange={e => setAssetsDeposited(e.target.value)}
                    style={ inputBoxStyle }
                />
            </label>
            <button type='submit' 
                    style={{ 
                        backgroundColor: '#C94091',
                        border: '1px solid',
                        borderColor: '#C94091',
                        borderRadius: '10px', 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        height: '50px',
                        width: '75%',
                        padding: '10px',
                        marginTop: '20px',
                        marginBottom: '40px'
                        }}
            >Submit</button>
        </form>
      </>    

    );
        
}
