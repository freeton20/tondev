export declare const BasicTest =
    "\"\"\"\n    This file was generated by EverDev.\n    EverDev is a part of EVER OS (see https://everos.dev).\n\"\"\"\nfrom tonos_ts4 import ts4\n\n\ndef test():\n    # Place your code of the test here\n    print('Ok')\n\n    \nif __name__ == '__main__':\n    # Initialize TS4 by specifying where the artifacts of the used contracts are located\n    # verbose: toggle to print additional execution info\n    ts4.init('contracts/', verbose = True)\n\n    test()\n\n"