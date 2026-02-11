import { Hero } from '../components/sections/Hero';
import { ValueBlocks } from '../components/sections/ValueBlocks';
import { Scrollytelling } from '../components/sections/Scrollytelling';
import { Categories } from '../components/sections/Categories';
import { PricingPackages } from '../components/sections/PricingPackages';
import { ProgressProof } from '../components/sections/ProgressProof';

export const Home = () => {
    return (
        <main>
            <Hero />
            <ValueBlocks />
            <Scrollytelling />
            <Categories />
            <PricingPackages />
            <ProgressProof />
        </main>
    );
};
