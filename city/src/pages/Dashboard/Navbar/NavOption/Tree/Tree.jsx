
//Style
import styles from './Tree.module.css'


export const Tree = ({
    numOptions = 0, //int
    isTooltip //true/false - Si es para mostrar con la navbar contraída
}) => {
    return(
        <div className={styles['wrapper']+' '+(isTooltip ? styles['wrapper--tooltip'] : '')}>
            {Array.from({ length: numOptions }).map((_, i) => (
                <div className={styles['lines__wrapper']} key={i}>
                    <div></div>
                    {i !== 0 &&
                        <div></div>
                    }
                    <div></div>
                    <div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            ))}
        </div>
    )
}