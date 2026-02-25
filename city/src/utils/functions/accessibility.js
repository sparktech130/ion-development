    
    //Al pulsar la tecla key ejecuta el onclick
    export const handleKey = (event, onClick, key='Enter') => {
        if(event.key === key){
            onClick() 
        }
    }