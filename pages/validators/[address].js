import { useRouter } from "next/router";
import animalHash from "angry-purple-tiger";

const ValidatorAddress = () => {
    const router = useRouter();
    const { address } = router.query;
    const name = animalHash(address);
    console.log(name);

    return (
        <>
            <p>Address: {address}</p>
            <p>Name: {name}</p>
        </>
    );
};

export default ValidatorAddress;
