pragma solidity >=0.6.0 <0.8.15;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/EnumerableMap.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./PixelsToken.sol";

/**
 * @title Pixels
 * Pixels - living canvas
 */

contract Pixels is AccessControl {
    using SafeMath for uint256;
    using Address for address;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableMap for EnumerableMap.UintToAddressMap;
    using Strings for uint256;

    PixelsToken public PixelsTokenContract;

    uint48 public maxPixels;

    EnumerableMap.UintToAddressMap private _pixels;

    mapping(uint256 => bytes6) public colors;
    mapping(uint256 => uint256) public bids;

    event ColorPixel(uint256 _position, bytes6 _color);
    event ColorPixels(uint256[] _positions, bytes6[] _colors);

    /**
     * @dev Contract Constructor, calls ERC721Batch constructor and sets name and symbol
     */
    constructor(uint48 _maxPixels, address _pixelsTokenAddress) public {
        require(_maxPixels > 0, "Pixels: Max pixels must be greater than 0");

        maxPixels = _maxPixels;

        PixelsTokenContract = PixelsToken(_pixelsTokenAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Get pixel color
     * @param _position pixel position in the world / id
     */
    function getColor(uint256 _position) public view returns (bytes6) {
        require(
            exists(_position),
            "Pixels: Make sure position exists before returning color"
        );

        return colors[_position];
    }

    /**
     * @dev Validate and set pixel color
     * @param _position pixel position in the world / id
     * @param _color pixel HEX color
     */
    function setColor(uint256 _position, bytes6 _color) public {
        require(
            msg.sender == ownerOf(_position),
            "Pixels: Only the owner can change color"
        );
        require(
            validateColor(_color),
            "Pixels: Must be a valid HEX color value"
        );

        colors[_position] = _color;

        emit ColorPixel(_position, _color);
    }

    /**
     * @dev Validate and set pixel color
     * @param _positions pixel positions in the world / id
     * @param _colors pixels HEX color
     */
    function setColors(uint256[] memory _positions, bytes6[] memory _colors)
        public
    {
        require(
            _positions.length == _colors.length,
            "Pixels: _positions and _colors length mismatch"
        );

        for (uint256 i = 0; i < _positions.length; i++) {
            uint256 _position = _positions[i];
            bytes6 _color = _colors[i];

            require(
                msg.sender == ownerOf(_position),
                "Pixels: Only the owner can change color"
            );
            require(
                validateColor(_color),
                "Pixels: Must be a valid HEX color value"
            );

            colors[_position] = _color;
        }

        emit ColorPixels(_positions, _colors);
    }

    /**
     * @dev expose _exists to the public
     * @param _position pixel position in the world / id
     */
    function exists(uint256 _position) public view returns (bool) {
        return _exists(_position);
    }

    /**
     * @dev set maxPixels
     * @param _maxPixels new maximum number of pixels
     */
    function setMaxPixels(uint48 _maxPixels) public onlyAdmin {
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
    function validateColor(bytes6 _color) private pure returns (bool) {
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
     * @dev Restricted to members of the admin role.
     */
    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Pixels: Restricted to admins."
        );
        _;
    }
}
