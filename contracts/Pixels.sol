pragma solidity >=0.6.0 <0.7.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Pixels
 * Pixels - non-fungible ERC721 pixels
 */

contract Pixels is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint48 public maxPixels;

    struct Pixel {
        uint48 createTime;
        bytes6 color;
    }

    mapping(uint32 => Pixel) public pixels;

    /**
     * @dev Contract Constructor, calls ERC721 constructor and sets name and symbol
     */
    constructor(uint48 _maxPixels) 
        public ERC721("PixelWorld", "PW") 
    {
        require(_maxPixels > 0, "Pixels: Max pixels must be greater than 0");

        maxPixels = _maxPixels;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Create new pixel
     * @param _position pixel position in the world / id
     * @param _color pixel HEX color
     * @param _owner owner of the newly created pixel
     */
    function createPixel(
        uint32 _position,
        bytes6 _color,
        address _owner
    ) public onlyMinter {
        require(_position > 0, "Pixels: Position must be provided");
        require(
            totalSupply() + 1 <= maxPixels,
            "Pixels: Cannot create more than max amount of pixels"
        );
        require(
            validateColor(_color),
            "Pixels: Must be a valid HEX color value"
        );

        pixels[_position] = Pixel({
            createTime: uint48(now), 
            color: _color
        });

        _safeMint(_owner, _position);
    }

    /**
     * @dev Get pixel color
     * @param _position pixel position in the world / id
     */
    function getColor(uint32 _position) 
        public 
        view 
        returns (bytes6) 
    {
        require(
            exists(_position),
            "Pixels: Make sure position exists before returning color"
        );

        return pixels[_position].color;
    }

    /**
     * @dev Validate and set pixel color
     * @param _position pixel position in the world / id
     * @param _color pixel HEX color
     */
    function setColor(uint32 _position, bytes6 _color) 
        public 
    {
        require(
            exists(_position),
            "Pixels: Make sure position exists before setting color"
        );
        require(
            msg.sender == ownerOf(_position),
            "Pixels: Only the owner can change color"
        );
        require(
            validateColor(_color),
            "Pixels: Must be a valid HEX color value"
        );

        pixels[_position].color = _color;
    }

    /**
     * @dev expose _exists to the public
     * @param _position pixel position in the world / id
     */
    function exists(uint32 _position) 
        public 
        view 
        returns (bool) 
    {
        return _exists(_position);
    }

    /**
     * @dev set maxPixels
     * @param _maxPixels new maximum number of pixels
     */
    function setMaxPixels(uint48 _maxPixels) 
        public 
        onlyAdmin 
    {
        require(
            _maxPixels > 0 && _maxPixels > totalSupply(),
            "Pixels: Max pixels must be greater than 0 and total current supply"
        );

        maxPixels = _maxPixels;
    }

    /**
     * @dev validate hex color - https://ethereum.stackexchange.com/questions/50369/string-validation-solidity-alpha-numeric-and-length
     * @param _color color value to validate
     */
    function validateColor(bytes6 _color) 
        private 
        pure 
        returns (bool) 
    {
        for (uint8 i; i < _color.length; i++) {
            bytes1 char = _color[i];

            if (
                !(char >= 0x30 && char <= 0x39) && //9-0
                !(char >= 0x41 && char <= 0x5A) && //A-Z
                !(char >= 0x61 && char <= 0x7A) //a-z
            ) return false;
        }

        return true;
    }

    /********
     * ACL
     */

    /**
     * @dev add minter
     * @param _account address to add as the new minter
     */
    function addMinter(address _account) 
        public 
        virtual 
        onlyAdmin 
    {
        grantRole(MINTER_ROLE, _account);
    }

    /**
     * @dev remove minter
     * @param _account address to remove as minter
     */
    function removeMinter(address _account) 
        public 
        virtual 
        onlyAdmin 
    {
        revokeRole(MINTER_ROLE, _account);
    }

    /**
     * @dev Restricted to members of the admin role.
     */
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Pixels: Restricted to admins."
        );
        _;
    }

    /**
     * @dev Restricted to members of the minter role.
     */
    modifier onlyMinter() {
        require(
            hasRole(MINTER_ROLE, msg.sender),
            "Pixels: Restricted to minters."
        );
        _;
    }
}
